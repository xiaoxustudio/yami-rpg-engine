// 「.vue 里的事件接线」口径的**单一真源**。
//
// 为什么要有这个模块（本次重构 P0）：`migration-ledger.mjs` 要按轴计数，守卫 spec 要按谓词判定，
// 两处如果各写一份正则，就会重演本仓白名单双写的漂移（`.oxlintrc.json` ↔ `dom-guard.mjs`
// 曾经一份 14 条、一份 46 条）。所以「什么叫一处自有元素监听」只在这里定义一次：
//
//   - 台账轴（`vue-local-listeners` / `vue-global-listeners`）用 `wiredListeners()`
//   - 守卫测试（`sfc-local-listener-wiring.spec.ts`）用 `wiresLocalListener()`
//
// 两个函数共用同一个 `LOCAL_LISTEN_RE`，因此台账的数字与守卫的红绿不可能互相矛盾。
//
// 本模块**零依赖 Node API**（与 `scan.mjs` 的其它纯函数一致），可直接喂源码字符串。
//
// ⚠️ **迁移手法上的一个坑（2026-10 实测，见 YMTextArea 改造）**：给模板根元素加 `@` 绑定时
// **不要把说明性 HTML 注释写在 `<template>` 的根元素之前**。Vue 会把那段注释当成模板的根节点，
// 于是 `@vue/test-utils` 的 `wrapper.element` 变成**注释节点**（`outerHTML` 就是那段注释），
// 连带 `wrapper.classes()` 恒为空数组、挂在根元素上的元素 api 读不到 —— 表现为一串看似与本次
// 改动无关的断言失败（实测 3 个用例红，而 `onMounted` 与 `attachApi` 其实都正常执行）。
// 说明文字请放在 `</script>` 之后、`<template>` 之前（SFC 允许 template 之外有顶层注释）。
//
// ⚠️ **保留原生监听时的四条判据**（2026-10 重构收尾时固化；遇到"为什么这里不用 `@`"先看这四条）：
//   1. **目标在不在本组件模板里**：注册表元素（`inspectorEls.get(...)` / `registryElements(...)`）、
//      父组件渲染的宿主元素（`YMFileBrowser` 的 `el.value = nav?.closest('.file-browser')`）、
//      `document.createElement` 造的元素 —— 都没有 `@` 落点，硬迁是白做功。
//   2. **同一元素同一事件只能有一个模板 `@`**。原有多个监听必须合并且**保序**
//      （合并前查冲突 handler 里有没有 `stopImmediatePropagation` —— 顺序可观测）。
//   3. **事件载荷形状可能不同**：元素优先 `on()` 给的是 DOM 事件（带 `.value` 之类载荷），
//      而组件 `@` 给的是 emit 出来的**值**。既有适配写法是把它重新包回去
//      （`(value) => Inspector?.xxx?.method?.({ value })`，`SceneAnimationPropertiesSection` 等三处都有）；
//      载荷无人使用时就放宽形参（`(_value?: unknown)`），别加多余的 `as never`。
//   4. **回调可能依赖 `this` = DOM 元素**：元素优先调用天然把 `this` 绑成元素，模板 `@` 给不了。
//      判断不是"用了 `this` 就不能迁"，而是**看事件槽位是否已被占用**：
//      空着就能迁（用薄包装 `.call(el, event)` 把元素绑回去，`FileAudioPage` 是范例）；
//      已被占就只能放弃（典型 `SceneTilemap.layerInput`，它的 `@input` 已归 `onParamInput`）。
//
// 具体站点的"为什么不可迁"写在**那些站点自己**的注释里
// （`YMCommandList.vue` 的 `update`/`rowmodel`、`YMFileHeadPane.vue` 的 `searcherEl`
//  `input`/`compositionend`、`SceneTilemapPropertiesSection.vue` 的 `layerInput`）——
// 知识要贴着会误改它的人，而不是留在一份会被删的过程文档里。

/**
 * 全局目标：绑定在它们上的监听属于「全局监听」口径（需要 `useEventListener` 保证摘除），
 * 不属于「自有元素监听」。
 */
const GLOBAL_OBJECTS = new Set([
	'window',
	'document',
	// 刻意**不列** `globalThis`：本仓没有任何一处对它挂监听，而 editor 有一条全仓审计
	// 禁止 `editor/src` 出现该标识符（`global-mounting.spec.ts`，朴素 `includes` 口径）。
	// 守卫 spec 里那份同源清单因此也不必列它——两边一致，正是「独立计数 == 基线」所依赖的。
	//
	// 也刻意**不列** `self`：浏览器里 `self === window`，但本仓 `.vue` 的脚本里
	// `self` 一律是**局部变量**且等于组件自己的根元素（`const self = el!`，随后
	// `attachApi(self, …)` / `getListConfig(self)`）。把它当全局目标会把
	// `self.addEventListener('scroll' | 'focus' | 'keydown' …)` 这类**自有元素**监听
	// 误记到全局轴上（实测 9 处，全在 `YMParamList` / `YMParameterPane`）。
	// 本仓要挂全局时一律显式写 `window` / `document`，故 `self` 归入自有元素口径。
	'global',
	'body',
	'head',
	'documentElement',
	'location',
	'navigator',
	'screen'
]);

/**
 * 自有元素监听：形如 `X.addEventListener(`，其中 `X` **不是**上面那批全局目标。
 *
 * 刻意按「属性访问」计数（不要求后面紧跟 `(`）：`el.addEventListener<Event>(…)` 这类
 * 带类型实参的写法跟在 `(` 之后仍会被命中，因为它匹配的是 `.addEventListener` 之后到 `(` 的区间。
 *
 * ⚠️ `X` 是标识符首字母时允许 `this.` 前缀（`this.input.addEventListener`）；`this.x` 在
 * `: 5` 这类上下文里会因 `[\w$.\[\]?]` 不含 `:` 而自然断掉，故不必单列。
 */
export const LOCAL_LISTEN_RE =
	/((?:this\s*\.\s*)?[A-Za-z_$][\w$]*(?:\s*(?:\?\.|\.)\s*[A-Za-z_$][\w$]*|\s*\[\s*['"`]?[\w$-]+['"`]?\s*\]|\s*\?\.\s*\[[^\]]*\]|\s*\?\s*)*)\s*\.addEventListener\s*(?:\?\.\s*)?\(/g;

/**
 * `window.addEventListener(` / `document.addEventListener(` 这类全局监听（保守口径，与既有守卫一致）。
 */
const GLOBAL_LISTEN_RE = /(?:window|document)\s*\.\s*addEventListener\s*(?:\?\.\s*)?\(/g;

/** 模板里的 `@事件` 绑定（用于报告"这个组件到底用没用 Vue 绑定"）。 */
const TEMPLATE_HANDLER_RE = /@[a-zA-Z][\w-]*/g;

/**
 * 取出 `<script>` 段原文（`<script setup>` 与 `<script>` 都算）。
 * `.vue` 的 template/style 里不该出现真实调用，但为稳妥仍只扫 script 段。
 */
export function scriptOf(src) {
	const blocks = src.match(/<script[^>]*>[\s\S]*?<\/script>/g);
	if (blocks === null) return src;
	return blocks.join('\n');
}

/** 取出 `<template>` 段原文（用于报告模板里有多少 `@` 绑定）。 */
export function templateOf(src) {
	const blocks = src.match(/<template[\s>][\s\S]*?<\/template>/g);
	if (blocks === null) return '';
	return blocks.join('\n');
}

/**
 * 把 SFC 源码压成「只剩 script 段代码」的形态。`scan.mjs` 的 `codeOnly` 会整段**跳过**
 * template（正确，DOM 迁移口径要的是"代码里有没有真实调用"），但它保留的 script 段之外
 * 仍含 `<template>` 标签本身，这里再收一次。
 *
 * 本模块不重复实现注释/字符串剥离——调用方应先把源码交给 `scan.mjs` 的 `codeOnly()`，
 * 再把结果交给本模块；这样「注释里写着原先 el.addEventListener」的历史记录不会被当成债。
 */
export function scriptOnly(src) {
	return scriptOf(src);
}

/**
 * 逐处列出 `.vue` script 段里的 `X.addEventListener(` 调用，并分类。
 *
 * @param {string} src SFC 原文（建议先经 `scan.mjs` 的 `codeOnly()` 去注释/字符串）
 * @returns {{ raw: string, object: string, global: boolean, local: boolean, index: number }[]}
 */
export function wiredListeners(src) {
	const script = scriptOnly(src);
	const out = [];
	LOCAL_LISTEN_RE.lastIndex = 0;
	let match;
	while ((match = LOCAL_LISTEN_RE.exec(script)) !== null) {
		const object = match[1].replace(/\s+/g, '');
		const leaf =
			object
				.replace(/^(?:this\.)?/, '')
				.split(/[.?[]/)
				.pop() ?? object;
		const isGlobal = GLOBAL_OBJECTS.has(object) || GLOBAL_OBJECTS.has(leaf);
		out.push({
			raw: match[0],
			object,
			global: isGlobal,
			local: !isGlobal,
			index: match.index
		});
	}
	return out;
}

/**
 * 谓词：源码里是否存在**绑定在自有元素上**的 `addEventListener`。
 * 守卫 spec 用它判定单个文件是否违规，也用它自证仪器。
 * @param {string} src
 * @returns {boolean}
 */
export function wiresLocalListener(src) {
	return wiredListeners(src).some((call) => call.local);
}

/**
 * 一次算出该 SFC 的事件接线画像，供台账按轴汇总。
 *
 * @param {string} src SFC 原文（建议先经 `codeOnly()`）
 * @returns {{
 *   localListeners: number,
 *   globalListeners: number,
 *   localFiles: 0 | 1,
 *   globalFiles: 0 | 1,
 *   templateHandlers: number,
 *   targets: string[]
 * }}
 */
export function eventWiringOf(src) {
	const calls = wiredListeners(src);
	const local = calls.filter((call) => call.local);
	const global = calls.filter((call) => call.global);
	const templateHandlers = (templateOf(src).match(TEMPLATE_HANDLER_RE) ?? []).length;
	return {
		localListeners: local.length,
		globalListeners: global.length,
		localFiles: local.length > 0 ? 1 : 0,
		globalFiles: global.length > 0 ? 1 : 0,
		templateHandlers,
		targets: [...new Set(local.map((call) => call.object))]
	};
}

/**
 * 全局监听（`window` / `document`）出现处数——用于 `vue-global-listeners` 轴的交叉核对。
 * 与 `eventWiringOf().globalListeners` 分开提供，是因为后者走同一条 `LOCAL_LISTEN_RE`，
 * 对 `window.addEventListener` 的书写形式更宽容；本函数是既有守卫的保守口径。
 * @param {string} src
 * @returns {number}
 */
export function countGlobalListeners(src) {
	GLOBAL_LISTEN_RE.lastIndex = 0;
	let count = 0;
	while (GLOBAL_LISTEN_RE.exec(scriptOnly(src)) !== null) count++;
	return count;
}

// ---------------------------------------------------------------------------
// 元素优先 on() API 口径
// ---------------------------------------------------------------------------

/** ui-kit `.vue` 里「定义 `on`」的形态：`const on = (`。 */
const ON_DEFINE_RE = /\bconst\s+on\s*=\s*\(/;

/** `.vue` 里把 `on` 交给 `attachApi(...)` 的装配点。 */
const ON_ATTACH_RE = /attachApi\s*(?:<[^>]*>)?\s*\(\s*[\w$]+\s*,\s*\{[\s\S]*?\bon\s*[,}]/;

/**
 * 元素优先 `on` API 的暴露面：一个 `.vue` 只要「定义了 `on`」或「把它交给 attachApi」，
 * 就算一处暴露。
 * @param {string} src SFC 原文
 * @returns {{ defines: boolean, attaches: boolean }}
 */
export function onApiSurfaceOf(src) {
	return {
		defines: ON_DEFINE_RE.test(src),
		attaches: ON_ATTACH_RE.test(src)
	};
}

/** editor 侧对 ui-kit 组件的 `.on('事件')` 消费者。 */
/**
 * editor 侧对 ui-kit 组件的 `.on('事件')` 消费者。
 *
 * ⚠️ 接收者必须能被**完整捕获**，否则下面的排除名单失效：本仓真实写法是
 * `fieldEls.get('block')?.on?.('closed', …)` —— 接收者是个**调用表达式**且带可选链。
 * 早期只用 `[\w$.[\]?]+`（不含 `(`/引号）时，正则只能从末尾的 `?` 开始匹配，
 * 于是 `object` 被捕获成 `"?"`、`leaf` 也是 `?`，`NON_UIKIT_ON_HOSTS` 一个都命中不了
 * （排除名单形同虚设），同时这类站点**整体漏计**（consumed 少报 52 处）。
 */
const ON_CONSUMER_RE = /([\w$.[\]?'"()]+)\s*\.\s*on\s*(?:\?\.\s*)?\(\s*['"]([\w:-]+)['"]/g;

/**
 * 原生宿主对象：它们的 `.on()` 不是 ui-kit 的元素优先 API，**动了就坏**，必须排除。
 * 依据逐条实测（2026-10）：
 *   - `texture.on('load'|'error')` → 贴图/图片对象
 *   - `zipfile.on(...)`           → yauzl
 *   - `writeStream.on(...)`       → node stream
 *   - `proxy.on(...)`             → `utils/radio-proxy` 的内部契约（RadioBox 用）
 *   - `scope.on(...)`             → `tools/` 遗留命令式代码，非 ui-kit 组件
 */
const NON_UIKIT_ON_HOSTS = new Set([
	'texture',
	'zipfile',
	'writeStream',
	'stream',
	'proxy',
	'scope',
	'audio',
	'video'
]);

/**
 * 统计 editor 侧仍在对 ui-kit 组件调用 `.on('事件')` 的站点。
 * @param {{ rel: string, full: string }[]} files
 * @param {(full: string) => string} read 读源码函数
 * @returns {{ total: number, sites: { rel: string, object: string, event: string }[] }}
 */
export function onApiConsumers(files, read) {
	const sites = [];
	for (const { full, rel } of files) {
		if (!rel.startsWith('packages/editor/')) continue;
		const src = read(full);
		ON_CONSUMER_RE.lastIndex = 0;
		let match;
		while ((match = ON_CONSUMER_RE.exec(src)) !== null) {
			const object = match[1];
			const leaf =
				object
					.replace(/[?[\]]/g, '')
					.split('.')
					.pop() ?? object;
			if (NON_UIKIT_ON_HOSTS.has(leaf)) continue;
			sites.push({ rel, object, event: match[2] });
		}
	}
	return { total: sites.length, sites };
}
