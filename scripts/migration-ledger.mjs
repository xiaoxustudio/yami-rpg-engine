#!/usr/bin/env node
// 迁移台账（Migration Ledger）：把「Vue 3 迁移还差什么」收敛成**一份可复现的数字**，
// 并用棘轮（ratchet）把它守住——只许变小，变大就红。
//
// 用法：
//   node scripts/migration-ledger.mjs                  打印台账 + 与 baseline 比对（只读）
//   node scripts/migration-ledger.mjs --json           机器可读 JSON（CI / 其它脚本消费）
//   node scripts/migration-ledger.mjs --check           任一轴**上升**则 exit 1（门禁用）
//   node scripts/migration-ledger.mjs --update-baseline 重写 baseline（人工复核后执行）
//   node scripts/migration-ledger.mjs --axis <id>       只看某一轴的明细
//
// 设计要点：
//   1. **不 spawn 子进程**。沙箱 / 受限 CI 里 spawn 会 EPERM，而「门禁起不来」会被误读成
//      「门禁通过」——这是最危险的失败模式。本脚本所有数字都来自纯文本扫描
//      （scripts/lib/scan.mjs），因此在任何环境都能跑出同样的结果。
//   2. **不使用 docs/**。`docs/` 已在 Phase 15 按收尾流程退役（dom-guard.mjs 源码专门注明
//      「不要再 mkdirSync」）。台账数字落在 scripts/migration-ledger-baseline.json。
//   3. **口径来自共享实现**。DOM 模式、监听器扫描、白名单都 import 自 scripts/lib/，
//      报表之间不可能再分叉。
//
// 与其它守卫的分工：
//   dom-guard.mjs         单轴深挖（受限 API 明细 + 陈旧豁免注释）
//   event-surface.mjs     单轴深挖（事件名 / 自定义事件 / 单侧事件）
//   global-types-audit.mjs 单轴深挖（global.d.ts 的接口块）
//   migration-ledger.mjs  **跨轴总账 + 棘轮**；消费上面三者的口径，不替代它们的明细

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
	ROOT,
	SCAN_DIRS,
	collectFiles,
	readSource,
	countCodeMatches,
	codeOnly,
	importRefs,
	unremovableListeners,
	hasDomExemption,
	DOM_PATTERNS,
	NULL_CAST_RE,
	UNKNOWN_CAST_RE,
	ANY_HATCH_RE,
	UI_SINGLETON_RE,
	DOM_AUX_PATTERNS,
	ELEMENT_API_PATTERNS,
	NATIVE_EVENTS,
	WINDOW_LIFECYCLE_EVENTS,
	countElementCustomEvents,
	windowEventSurfaceOf
} from './lib/scan.mjs';
import { loadDomWhitelist, readDomWhitelist } from './lib/dom-whitelist.mjs';
import {
	uiSlotCoverage,
	declaredSlots,
	singletonPlaceholders,
	LEGACY_UI_DIR,
	legacyOnlyStoreSlots,
	uiFacadeGaps,
	domainSingletonImporters
} from './lib/ui-slots.mjs';
import { eventWiringOf, onApiSurfaceOf, onApiConsumers } from './lib/event-wiring.mjs';

const BASELINE_FILE = join(ROOT, 'scripts', 'migration-ledger-baseline.json');

// ---------------------------------------------------------------------------
// 轴定义
// ---------------------------------------------------------------------------

/** 按「真实代码」统计每个文件与总量（排除注释/字符串/.vue 的 template+style） */
function countCodeByFile(files, re) {
	let total = 0;
	const perFile = [];
	for (const { full, rel } of files) {
		const n = countCodeMatches(readSource(full), re);
		if (n === 0) continue;
		total += n;
		perFile.push({ rel, count: n });
	}
	perFile.sort((a, b) => b.count - a.count || a.rel.localeCompare(b.rel));
	return { total, fileCount: perFile.length, perFile };
}

/**
 * 同 `countCodeByFile`，但计数函数自带口径（事件名在字符串里，不能用 `codeOnly`）。
 * @param {(src: string) => number} counter
 */
function countByCounter(files, counter) {
	let total = 0;
	const perFile = [];
	for (const { full, rel } of files) {
		const n = counter(readSource(full));
		if (n === 0) continue;
		total += n;
		perFile.push({ rel, count: n });
	}
	perFile.sort((a, b) => b.count - a.count || a.rel.localeCompare(b.rel));
	return { total, fileCount: perFile.length, perFile };
}

/**
 * 取共享口径里的某条正则。**缺失即抛错** —— 静默 `undefined` 会让 `countMatches` 直接炸，
 * 或更糟：被 try/catch 吞掉后轴恒读 0（「仪器瞎了」的经典形态）。口径只在 `scan.mjs` 维护。
 */
function reOf(list, key, axisId) {
	const found = list.find((p) => p.key === key);
	if (!found) throw new Error(`${axisId}: 口径 ${key} 不在 scripts/lib/scan.mjs 里`);
	return found.re;
}

/**
 * 每个轴 = { id, label, target, measure() }。
 *   target: 'zero'    —— 终态为 0（能逐轮下降直到销账）
 *           'stable'  —— 只要求不增长（含合理保留项）
 *           'boolean' —— 0/1 状态位，1 才算收尾
 * measure() 返回 { value, detail }：
 *   value 为数字或「数字字段的对象」；对象时所有数字字段一起参与棘轮比对。
 */
function buildAxes() {
	const src = collectFiles({ dirs: SCAN_DIRS });
	const srcWithTests = collectFiles({ dirs: SCAN_DIRS, includeTests: true });
	// 事件接线三轴只关心 SFC：`.ts` 里没有 template/emits，事件面口径不适用于它。
	const vues = src.filter((f) => f.rel.endsWith('.vue'));
	const { match: isWhitelisted, patterns: whitelistPatterns } = loadDomWhitelist();

	return [
		{
			id: 'dom-pending',
			label: 'DOM 待迁移文件（受限 API 命中且未进白名单）',
			target: 'zero',
			measure() {
				const offenders = [];
				for (const { full, rel } of src) {
					if (isWhitelisted(rel)) continue;
					const source = readSource(full);
					const hits = DOM_PATTERNS.filter((p) => p.lint).reduce(
						(sum, p) => sum + countCodeMatches(source, p.re),
						0
					);
					if (hits > 0) offenders.push({ rel, hits });
				}
				offenders.sort((a, b) => b.hits - a.hits || a.rel.localeCompare(b.rel));
				return {
					value: {
						total: offenders.length,
						hits: offenders.reduce((s, o) => s + o.hits, 0)
					},
					detail: offenders.slice(0, 15)
				};
			}
		},
		{
			id: 'dom-whitelist-drift',
			label: '设计豁免白名单双源漂移（.oxlintrc.json ↔ 台账）',
			target: 'zero',
			measure() {
				// 单一真源后这里**按构造**恒为 0。保留这条轴是为了让「有人又把名单抄回脚本里」
				// 这件事立刻可见：漂移的定义 = 白名单 glob 与它实际覆盖的文件对不上。
				const entries = readDomWhitelist();
				const covered = srcWithTests.filter((f) => isWhitelisted(f.rel));
				// 一条 glob 都没覆盖到任何文件 ⇒ 要么写错了，要么文件已删（陈旧白名单）
				const res = entries.map((e) => {
					// glob → 正则（`**` 跨目录、`*` 不跨目录）。
					//
					// ⚠️ 必须**一趟**替换完（用回调区分 `**` 与 `*`）。早先写法是先替 `**`→`.*`
					// 再替 `*`→`[^/]*`，为不让第二趟吃掉第一趟产出的 `*`，中间塞了个 0 号哨兵字符
					// —— 而正则里的控制字符会被 `eslint/no-control-regex` 判为坏味道（它是对的）。
					// 一趟替换既去掉哨兵，又保证与 `scripts/lib/dom-whitelist.mjs` 的 `globToRegExp()`
					// **逐字同源**（`dom-whitelist-drift` 轴正是靠这两份实现互相印证）。
					const re = new RegExp(
						`^${String(e.pattern)
							.replace(/[.+^${}()|[\]\\]/g, '\\$&')
							.replace(/\*\*|\*/g, (m) => (m === '**' ? '.*' : '[^/]*'))}$`
					);
					return {
						pattern: e.pattern,
						hits: srcWithTests.filter((f) => re.test(f.rel)).length
					};
				});
				const stale = res.filter((r) => r.hits === 0);
				return {
					value: {
						total: stale.length,
						patterns: entries.length,
						coveredFiles: covered.length
					},
					detail: stale
				};
			}
		},
		{
			id: 'dom-on-exempted',
			label: 'DOM 受限 API 命中落在白名单内（设计豁免在用）',
			target: 'stable',
			measure() {
				let hits = 0;
				const perFile = [];
				for (const { full, rel } of src) {
					if (!isWhitelisted(rel)) continue;
					const n = DOM_PATTERNS.filter((p) => p.lint).reduce(
						(sum, p) => sum + countCodeMatches(readSource(full), p.re),
						0
					);
					if (n > 0) {
						hits += n;
						perFile.push({ rel, hits: n });
					}
				}
				perFile.sort((a, b) => b.hits - a.hits || a.rel.localeCompare(b.rel));
				return {
					value: { total: hits, files: perFile.length },
					detail: perFile.slice(0, 10)
				};
			}
		},
		// -------------------------------------------------------------------
		// Vue 化收尾：元素 API / 命令式 DOM / 事件所有权
		//
		// 门禁上的 `dom-pending` / `vue-global-listeners` 归零只说明「document.* 与 .vue 里的
		// 裸 window 监听」清完了；**状态与事件的所有权**仍大量留在 DOM 上（元素 API 装配、
		// 字符串注册表寻址、用 Event 当组件事件通道、模块直接改 class/style/文本）。
		// 下面这组轴把它们变成可下降的数字。
		//
		// target 口径（别把「不增」读成「不打算消」）：
		//   · 元素 API / 注册表 / 类型引用 / 事件构造 / 容器式回调 —— `zero`：没有合法残留，
		//     按组件族「先试点、再铺开」逐批消除。
		//   · 直写 style / class / 文本 / 结构反查 / 测量 —— `stable`：这些轴里**含受控缝隙**
		//     （`utils/dom.ts` 的 measureText、webgl、打印画布、离屏 vnode），终态不是 0。
		//     把受控缝隙收窄到「白名单 + 逐条理由」之后，可以改回 `zero`。
		//     这与 `vue-local-listeners` 从 zero 改 stable 是同一条理由：轴的行为不变，变的只是
		//     报表里那句话是否诚实。
		// -------------------------------------------------------------------
		{
			id: 'dom-style-writes',
			label: '样式直写 .style.X =（应改 :style 绑定）',
			target: 'stable',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(DOM_AUX_PATTERNS, 'styleWrite', 'dom-style-writes')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'dom-class-state',
			label: 'class 当状态（classList 增删、hasClass）',
			target: 'stable',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(DOM_AUX_PATTERNS, 'classState', 'dom-class-state')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'dom-text-writes',
			label: '文本直写 .textContent =（应改模板插值）',
			target: 'stable',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(DOM_AUX_PATTERNS, 'textWrite', 'dom-text-writes')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'dom-tree-walk',
			label: 'DOM 结构反查（parentElement/closest/兄弟）',
			target: 'stable',
			measure() {
				// `.children` 不在口径里：树数据与 DOM 子节点同形，词法不可区分（见 scan.mjs）。
				const r = countCodeByFile(
					src,
					reOf(DOM_AUX_PATTERNS, 'domTreeWalk', 'dom-tree-walk')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'dom-measure-reads',
			label: '布局测量（client*/offset*/getComputedStyle）',
			target: 'stable',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(DOM_AUX_PATTERNS, 'measureRead', 'dom-measure-reads')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'element-api-attach',
			label: '元素 API 装配（attachApi / attachElementApi）',
			target: 'zero',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(ELEMENT_API_PATTERNS, 'attach', 'element-api-attach')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'element-registry-lookups',
			label: '元素注册表寻址（*Els.get、registryElement(s)）',
			target: 'zero',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(ELEMENT_API_PATTERNS, 'registryLookup', 'element-registry-lookups')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'yami-element-refs',
			label: 'YamiElement 类型引用（元素契约存量）',
			target: 'zero',
			measure() {
				const r = countCodeByFile(
					src,
					reOf(ELEMENT_API_PATTERNS, 'yamiElementType', 'yami-element-refs')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'element-custom-events',
			label: '元素级自定义事件构造（new XxxEvent）',
			target: 'zero',
			measure() {
				// 事件名在字符串里 ⇒ 这一轴必须用 `countElementCustomEvents`（stripComments +
				// scriptOnly），不能用 `countCodeByFile`（codeOnly 会把事件名一起抹掉，恒读 0）。
				const r = countByCounter(src, countElementCustomEvents);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'window-custom-events',
			label: 'window 自定义事件名（生命周期除外）',
			target: 'zero',
			measure() {
				// 生命周期三条（boot-ready / yami:error / vue-app-mounted）是**保留项**：
				// 它们跨 Vue 挂载边界与启动顺序，一次性的 window 事件是合适载体。
				// 其余（datachange / themechange / localize / dprchange…）应改 store 订阅或进程内 bus。
				//
				// dead = 只有派发没有监听（或反之）—— 死事件应当直接删，而不是迁移。
				const byName = new Map();
				const slotOf = (name) => {
					let slot = byName.get(name);
					if (slot === undefined) {
						slot = { emits: new Set(), listens: new Set() };
						byName.set(name, slot);
					}
					return slot;
				};
				for (const { full, rel } of src) {
					const surface = windowEventSurfaceOf(readSource(full));
					for (const name of surface.emits) slotOf(name).emits.add(rel);
					for (const name of surface.listens) slotOf(name).listens.add(rel);
				}
				const names = [...byName.entries()]
					.filter(
						([name]) => !NATIVE_EVENTS.has(name) && !WINDOW_LIFECYCLE_EVENTS.has(name)
					)
					.sort((a, b) => a[0].localeCompare(b[0]));
				const detail = names.map(([name, v]) => ({
					rel: name,
					emits: v.emits.size,
					listens: v.listens.size
				}));
				return {
					value: {
						total: names.length,
						dead: detail.filter((d) => d.emits === 0 || d.listens === 0).length
					},
					detail
				};
			}
		},
		{
			id: 'render-callback-props',
			label: '容器式渲染回调（renderX(… container)）',
			target: 'zero',
			measure() {
				// 这是「元素优先」契约里最难用 Vue 表达的一处：组件把**裸容器**交回调用方，
				// 调用方只能写命令式 DOM。终态是 scoped slot（`#node-extras="{ item }"`）。
				const r = countCodeByFile(
					src,
					reOf(ELEMENT_API_PATTERNS, 'renderCallbackProp', 'render-callback-props')
				);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'legacy-ui-refs',
			label: '引用遗留 UI 单例（@app/engine/ui/legacy/*）',
			target: 'zero',
			measure() {
				// 口径：遗留 UI 单例家族（`ui-window.ts` 及其域模块）的**静态依赖**。
				//
				// ⚠️ 2026-09-21 修过一次「仪器瞎了」，两个原因叠加，读数假 0：
				//
				//  1. **路径过时**：正则还写着 `^@app/ui/…`，而一次纯搬运已把 `src/ui/` 搬到
				//     `src/engine/ui/legacy/` ⇒ 一条都不匹配。（同轮把 `ui-slots.mjs` /
				//     `self-test.mjs` 都改成了动态定位，**只有这里漏了**。这条轴的标签一直写着
				//     「0 files=0」，读起来就像「遗留层已经没人引用了」——而 `ui-singleton-members`
				//     同时报 103 处挂载。**两条轴自相矛盾时，先怀疑仪器。**）
				//  2. **写法过窄**：`collectImports` 当时只认 `import … from`，而现在的引用点
				//     `tools/window-cluster.ts` 用的是 **`export { UI } from '…'`**（再导出）。
				//     只改路径不补写法，这条轴**仍然是 0**。所以同轮给 `collectImports` 补了
				//     `export … from`（它也确实是静态运行时依赖）。
				//
				// 保留的排除：`@app/engine/ui/*`（元素类等）不属于遗留层。
				const r = importRefs(src, /^@app\/engine\/ui\/legacy\//);
				return {
					value: { total: r.total, runtime: r.runtime, files: r.perFile.length },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'legacy-ui-lines',
			label: '遗留层 UI 单例目录行数（engine/ui/legacy/*）',
			target: 'zero',
			measure() {
				// ⚠️ 第 212 轮起目录用**常量** `LEGACY_UI_DIR`，不再由 `dirname(uiWindowRel())` 推导。
				//
				// 这条轴历史上踩过两次同类坑，两次都是「挪了目录、仪器跟着瞎」：
				// ① 它曾经写死 `packages/editor/src/ui`，而一次纯搬运把 8 个域模块搬到了
				//    `src/engine/ui/legacy/`；`collectFiles` 对**不存在的目录返回 `[]`（不抛错）**，
				//    于是它读到 0 并报「✓ 已完成」——而遗留代码一行都没少。
				// ② 改用 `dirname(uiWindowRel())` 之后，坑换了个方向：④-4 把单例搬出 `legacy/`，
				//    那个 dirname 会变成 `engine/ui/` ⇒ 本轴从 210 行**暴涨**成全目录行数（假回归），
				//    同时 `legacyOnlyStoreSlots()` 会把每个域模块都当成遗留层。
				// ⇒ 本轴问的是「**那层遗留还在不在**」，所以目录就是遗留层自己的名字（常量）。
				//    目录被删掉之后它自然读到 0 —— 那才是真归零。
				const files = collectFiles({ dirs: [LEGACY_UI_DIR], includeTests: true });
				const rows = files.map(({ full, rel }) => ({
					rel,
					lines: readSource(full).split('\n').length
				}));
				rows.sort((a, b) => b.lines - a.lines || a.rel.localeCompare(b.rel));
				return {
					value: { total: rows.reduce((s, r) => s + r.lines, 0), files: rows.length },
					detail: rows
				};
			}
		},
		{
			id: 'ui-singleton-members',
			label: '遗留 UI 单例成员挂载（UI.<name> = 处数，不受目录影响）',
			target: 'zero',
			measure() {
				// 为什么必须有这条轴（2026-09-20 实测的度量漏洞）：
				//
				// `legacy-ui-lines` 的口径是 `collectFiles({ dirs: ['packages/editor/src/ui'] })`
				// ——**目录**行数。阶段 1c 的第 ② 步是「把 8 个域模块**原样搬到**
				// `engine/ui/`，内容零改动，只改 import 路径」，那一步会让 `legacy-ui-lines`
				// **立刻读到 0**，而遗留代码一行都没少。实测 `collectFiles` 对不存在的目录
				// 返回 `[]`（不抛错），所以这条轴会**静默变绿**，后续 ③④ 步再无数字守着。
				//
				// 本口径按 `UI.x = ` 赋值处数计，与文件在哪个目录无关：
				// 纯移动不会让它下降，只有真正把成员迁走才会。两条轴**同时**归零才算 1c 收口。
				//
				// 站点构成（2026-09-20 起始值 103 处 / 8 文件）：
				//   ui-events 21 · ui-window 21（全是 `UI.x = UIEngine.x` 镜像）· ui-transform 18
				//   ui-file 15 · ui-list 10 · ui-prefab 9 · ui-pointer 8 · ui-initialize 1
				//
				// ⚠️ 不要改用「行首锚定」近似：`ui-prefab.ts:105` 是链式赋值
				// `uiElClasses.createElement = UI.createElement = …`，行首数不到它
				// （文档里「102 处」就是那么来的，比真实值少 1）。同理裸 `\s*=` 会把
				// `UI.dragging === null` 数成赋值（+1）。正则与理由见 `scan.mjs`。
				const r = countCodeByFile(src, UI_SINGLETON_RE);
				return {
					// `declared` = 对象字面量**自身**的槽位数（起始 134）。
					// `placeholders` = 其中**值为 `null` 的占位数**（起始 123）—— 第 212 轮新增。
					//
					// 1c 的第 ④ 步是「对象字面量退役」，而守它的 `legacy-ui-lines` 是**目录**
					// 口径 —— 第 ② 步搬完就 0。若本轴只数挂载点，「删掉 21 行镜像、留下字面量」
					// 就能让它归零，1c 会在**字面量还在**的情况下被判收口。
					//
					// ⚠️ **2026-09-25 第 212 轮改口径**：原先只报 `declared`，而 ④-4 真正要退役的是
					// **占位表**（`initialize: null` / `open: null` … 那 123 行「先声明、后填充」的骨架）。
					// 单例**自己真的持有**的字段（7 个 DOM 引用 + `dragging`/`hover` + 两个定时器 +
					// `translationKey`）必须有初值，不能跟着一起删 —— 所以 `declared` 永远到不了 0，
					// 而「占位表退役」这件事在旧读数里**看不出来**。
					// ⇒ `placeholders == 0` 是 ④-4 那一段的验收线；`declared` 继续回答"字面量还剩几条"。
					// 口径定义与依据见 `scripts/lib/ui-slots.mjs` 的 `placeholderSlotsFrom()`。
					//
					// `declaredSlots()` / `placeholderSlots()` 都按内容定位 UI 窗口文件（原先是写死路径），
					// 否则第 ② 步的纯搬运会让它们静默返回空数组 —— 那同样是「仪器瞎了」。
					value: {
						total: r.total,
						files: r.fileCount,
						declared: declaredSlots().length,
						placeholders: singletonPlaceholders().length
					},
					detail: r.perFile
				};
			}
		},
		{
			id: 'ui-domain-singleton-imports',
			label: '域模块仍静态 import 遗留单例（④-3 的伴随判据）',
			target: 'zero',
			measure() {
				// 与 `ui-singleton-members` **同生共死**：那条轴数「挂载文本」（可被改写法白拿），
				// 这条数「域模块是否还依赖单例本身」（改写法拿不到）。两条同时归零才算 ④-3 收口。
				// 设计依据与实测（三种改写法命中都是 0）见本文件 `domainSingletonImporters()` 的注释。
				const r = domainSingletonImporters();
				return { value: { total: r.total }, detail: r.perFile };
			}
		},
		{
			id: '1c-store-slot-gaps',
			label: '实现只在遗留层的 store 槽位（1c 第 ③ 步工作单）',
			target: 'zero',
			measure() {
				// 为什么必须有这条轴（2026-09-21 实测的度量缺口）：
				//
				// `ui-slot-coverage.total`（= storeRefsUnassigned）**恒为 0** —— `assignedSlots()`
				// 把遗留目录里的 `UI.x = …` 也算成「已赋值」。于是「删掉遗留层会让哪些动作静默
				// 失效」在台账上完全不可见，只有**手工数**出来的「store 尚缺 41 个
				// 槽位」记着这件事，而那个数字没有任何轴守着（文档会过时，轴不会）。
				//
				// 本轴数的是「实现只在遗留目录里」的 store 引用槽位：搬走一个降 1。
				// 与 `ui-singleton-members` **同生共死** —— 两条轴同时归零才算 1c 收口，
				// 这条自证写在 `self-test.mjs` 里。
				//
				// 交叉验证：首轮实测 **41**，与当年手工数出的 41 一致 —— 口径正确。
				const slots = legacyOnlyStoreSlots();
				return {
					value: { total: slots.length, storeRefs: uiSlotCoverage().storeRefs },
					detail: slots.map((rel) => ({ rel }))
				};
			}
		},
		{
			id: 'ui-facade-gaps',
			label: '引擎读的 UI 成员尚无显式归属（1c 第 ④ 步工作单）',
			target: 'zero',
			measure() {
				// 为什么必须有这条轴（2026-09-21 第 99 轮实测）：
				//
				// ③ 收口后 `1c-store-slot-gaps` 归零，但那只说明**实现搬出了遗留目录**，
				// 不说明谁**拥有**它们 —— `ui-singleton-members` 仍是 103 处。
				// ④ 要退役对象字面量，而对象字面量今天是靠
				// `} satisfies Partial<UIShape> as Partial<UIShape> as UIShape;` + `UIShape` 的
				// `[k: string]: any` 索引签名兜着 —— **引擎读成员时没有任何类型契约**。
				//
				// 本轴把 ④ 的目标量成一个数：引擎以 `this` 读到的成员里，还没有「显式归属」
				// （不在 store 的 `uiStateKeys`、也不在 facade 契约里）的有几个。首轮实测 **21**，
				// 与第 99 轮手工核对的结果一致。**只暴露 total**（分母 engineReads 会随实现变化，
				// 把它做成受棘轮的数字会误拦正确的改动）。
				const { missing } = uiFacadeGaps();
				return {
					value: { total: missing.length },
					detail: missing.map((name) => ({ rel: name }))
				};
			}
		},
		{
			id: 'null-casts',
			label: '遗留单例形状：null as unknown as',
			target: 'zero',
			measure() {
				const r = countCodeByFile(src, NULL_CAST_RE);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'unknown-casts',
			label: '双重断言 as unknown as',
			target: 'zero',
			measure() {
				const r = countCodeByFile(src, UNKNOWN_CAST_RE);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'any-hatches',
			label: '泛型逃生口 [k|key: string]: any / Record<string, any>',
			target: 'zero',
			measure() {
				// 口径在 2026-09-20 扩过一次：原先只数索引签名 `[k: string]: any`，
				// 看不见 `Record<string, any>`（实测 35 处 / 31 文件）。两者是**同一个逃生的
				// 两种写法**，只数一种的话，改个写法就能凭空「归零」。扩展当轮：
				// 32（索引签名）+ 35（Record）= **67 处 / 38 文件**，已按棘轮纪律显式记入新基线。
				const r = countCodeByFile(src, ANY_HATCH_RE);
				return {
					value: { total: r.total, files: r.fileCount },
					detail: r.perFile.slice(0, 20)
				};
			}
		},
		{
			id: 'unremovable-listeners',
			label: '内联匿名监听（window；含进程级常驻，仅需不增）',
			target: 'stable',
			measure() {
				// 口径说明：这一轴把**两类**东西放在一起——模块作用域注册一次的进程级常驻监听
				// （keyboard / dpr / main / webgl-init / toast / constants / net /
				// setting-config 等），以及类成员里随实例增长的潜在泄漏。
				// 前者没有 remove 也不构成泄漏，所以这一轴只要求「不增」，不设归零。
				//
				// **已修的两处实例级泄漏**（2026-09-17，改用具名引用 + 幂等注册）：
				//   - services/file-system/directory-tree.ts —— initialize() 的 focus 监听
				//   - tools/event-list.ts —— initialize() 的 localize 监听（15 个检查器页面各注册一份）
				//
				// 自动化替代方案试过并**放弃**：`scan.mjs` 的 `unpairedNamedListeners()`
				//（「同文件里有 remove 纪律却漏摘的具名监听」）实测报 66 处 / 21 文件，绝大多数是误报
				// ——`addEventListener('pointerup', this.pointerup)` 在多个元素上注册而 remove 只做一次
				// 是常见且正确的写法，按「句柄名是否出现过」无法区分。宁可这条轴只覆盖匿名监听，
				// 也不要报一个大半是噪音、没人会逐条核对的数字。
				const r = unremovableListeners(src);
				return {
					value: { total: r.count, files: r.files.length },
					detail: r.files.map(([rel, n]) => ({ rel, count: n }))
				};
			}
		},
		{
			id: 'vue-local-listeners',
			label: '.vue 内自有元素监听（余量已是豁免项，仅需不增）',
			// 从 `zero` 改成 `stable` 的理由（2026-10 逐站点实测）。**这不是"降低标准"**：
			// `compare()` 与 `target` 无关，两种目标的棘轮行为完全一样（都只判"升"）；
			// 改的只是**报表里那句话是否诚实** —— 否则"归零 / 74"会让人以为还剩 74 处债要清。
			//
			// 余量的构成（逐站点核对过目标表达式与位置，**无一是"还没迁"**）：
			//   · 21 处 `on()` 定义体 + 4 处 `on('focus'/'blur')` 桥 —— **永久保留**：
			//     `uikit-on-api` 的下界是 13（其中 12 处 store/composable 消费方**没有模板**），
			//     所以 `on()` 这条公共 API 不能删，它的实现体就一直计入本轴。
			//     **两条轴的下界互相锁死**，不存在"删掉 on() 就自动清掉一批"。
			//   · ~20 处命令式创建的游离元素（`createTextBox()` 造的 `tb`/`tb.input`、
			//     控件 `input`、`slider.input`）—— 不在本组件模板里，无 `@` 可标注
			//   · 11 处注册表元素（`inspectorEls.get(...)` / `registryElements(...)` 取的）
			//   · 11 处**父组件渲染的宿主元素**：`YMFileBrowser` 的全部站点挂在
			//     `el.value = nav?.closest('.file-browser')` 取到的**祖先容器**上，
			//     而画那个容器的是父组件 `layout/ProjectPanel.vue`、`tools/Selector.vue`
			//   · 2 处需要原生事件对象：`YMFileHeadPane` 的 `searcherEl.root` 回调读
			//     `InputEvent.inputType`，而组件的 `input` emit 带的是**值**（且它没有 `compositionend` emit）
			//   · 2 处已实测不可迁：`YMCommandList` 的 `update`/`rowmodel` —— 模板通道不生效，
			//     成因是 `utils/dom.ts` 里**复用的非冒泡事件实例** + `rows` 为 `shallowRef`
			//     且模型原地变更，重渲染对调用次数/时机敏感
			//   · 1 处游离元素工厂（`YMToastManager` 的 toast，`createElement` 造出来 append 的）
			//   · 1 处 editor `WindowFrame` 的 cancel 按钮 click（与窗口体系重叠，待一并判断）
			target: 'stable',
			measure() {
				// 口径见 `lib/event-wiring.mjs`（与守卫 spec 共用同一份正则，因此台账数字与门禁红绿
				// 不可能互相矛盾）。排除 window/document 等全局目标——那些归 `vue-global-listeners`。
				//
				// 为什么这条轴不在 lint 里：`.oxlintrc.json` 的 `no-restricted-properties` 按
				// `object` 字面量匹配，`el.addEventListener(...)` 的 `el` 是任意标识符，规则
				// 无法表达「除了 window/document 之外的任何目标」。故用台账棘轮 + 守卫 spec 承担。
				const perFile = [];
				let total = 0;
				for (const { full, rel } of vues) {
					const w = eventWiringOf(codeOnly(readSource(full)));
					if (w.localListeners === 0) continue;
					total += w.localListeners;
					perFile.push({ rel, count: w.localListeners, targets: w.targets });
				}
				return {
					value: { total, files: perFile.length },
					detail: perFile.sort((a, b) => b.count - a.count)
				};
			}
		},
		{
			id: 'vue-global-listeners',
			label: '.vue 内裸 window/document 监听（应改 useEventListener）',
			target: 'zero',
			measure() {
				// 「裸」= 直接写 `window.addEventListener(`，未经 composer 收口。`useEventListener`
				// 内部持有目标对象、不出现 `window.` 字面量，因此迁移后自然归零。
				//
				// 计数走 `eventWiringOf().globalListeners`（与「自有元素」同一套路由器，因而
				// `local + global` 恒等于该文件 script 段的 `addEventListener` 总数）；
				// 不另用保守正则 `countGlobalListeners`——两者实测差 9 处（46 vs 37，
				// 差异在 YMParameterPane / YMParamList 的多写形式），同一份报表里两个数会互相打脸。
				const perFile = [];
				let total = 0;
				for (const { full, rel } of vues) {
					const w = eventWiringOf(codeOnly(readSource(full)));
					if (w.globalListeners === 0) continue;
					total += w.globalListeners;
					perFile.push({ rel, count: w.globalListeners });
				}
				return {
					value: { total, files: perFile.length },
					detail: perFile.sort((a, b) => b.count - a.count)
				};
			}
		},
		{
			id: 'uikit-on-api',
			label: '元素优先 on() API（消费站点已达下界，仅需不增）',
			// 从 `zero` 改成 `stable` 的理由（2026-10）：消费站点 59 → 13 后**已到可达下界**，剩下 13 处里 12 处在
			// `stores/selector.ts`(6) / `stores/browser.ts`(5) / `composables/useIfConditionFields.ts`(1)
			// —— **这些文件没有模板**，`@` 无从附着；它们靠 `Selector.body` / `Browser.body`
			// 这类元素 API 对象取元素，元素优先 API 是唯一手段。
			// 剩 1 处（`SceneTilemapPropertiesSection` 的 `input`）的回调
			// `SceneTilemap.layerInput` **靠 `this` 拿元素**（`focusing === this`），
			// 且该 `SelectBox` 的 `@input` 已被 `onParamInput` 占用。
			//
			// ⇒ **`on()` 这条 API 不能删**（`exposed` 也就不能归零），这也意味着
			// `vue-local-listeners` 里那 21 处 `on()` 定义体 + 4 处桥**永久保留**。
			// 改 `target` 不影响棘轮行为（`compare()` 只看升/降），只是让报表不再暗示一件做不到的事。
			target: 'stable',
			measure() {
				// 两半一起看：
				//   exposed  = ui-kit `.vue` 仍定义/装配 `on`（元素优先事件 API 的暴露面）
				//   consumed = editor 侧仍调用 `.on('事件')`（已剔除原生宿主对象，见 NON_UIKIT_ON_HOSTS）
				// 「暴露面归零」而消费站点不为零是坏状态（会把消费者打断），反之亦然——故两条子指标
				// 都在同一轴上，棘轮会同时盯住。
				const exposed = [];
				for (const { full, rel } of vues) {
					if (!rel.startsWith('packages/ui-kit/')) continue;
					const surface = onApiSurfaceOf(readSource(full));
					if (surface.defines || surface.attaches) {
						exposed.push({ rel, defines: surface.defines, attaches: surface.attaches });
					}
				}
				const consumers = onApiConsumers(src, readSource);
				return {
					value: {
						total: exposed.length + consumers.total,
						exposed: exposed.length,
						consumed: consumers.total
					},
					detail: [...exposed, ...consumers.sites]
				};
			}
		},
		{
			id: 'stale-exemptions',
			label: '陈旧豁免注释（注释在、命中已为 0）',
			target: 'zero',
			measure() {
				const stale = [];
				for (const { full, rel } of src) {
					const source = readSource(full);
					if (!hasDomExemption(source)) continue;
					const hits = DOM_PATTERNS.filter((p) => p.lint).reduce(
						(sum, p) => sum + countCodeMatches(source, p.re),
						0
					);
					if (hits === 0) stale.push({ rel });
				}
				return { value: { total: stale.length }, detail: stale };
			}
		},
		{
			id: 'ui-slot-coverage',
			label: 'store 引用的 UI 槽位从未被赋值（会静默读到 undefined）',
			target: 'zero',
			measure() {
				// store 的动作层是 `UI?.x?.()`：槽位不存在时**静默返回 undefined、不报错**，
				// 于是「某功能静默不工作」既过 tsc（UIShape 有 [k: string]: any）也过 oxlint。
				// 这条轴把那个缺口变成可测量的数字（`total` = 未赋值却仍被引用的槽位数，终态 0）。
				//
				// `storeRefs` = store 引用到的槽位总数 —— 它们**在删掉 `src/ui/` 时会全部失效**
				// （惰加载 ui-window 挂了 ⇒ UI 永远 undefined），所以这才是「1c 还要处理多少」的口径。
				// `engineBacked` = 其中实现已在 `ui-engine.ts` 里的个数（**上升是好事**）。
				//
				// 曾经这里还有个 `legacyOnly` 被当棘轮指标，已删除：它把「把转发器抽成工厂函数」
				// 这种纯重构也算成依赖变重（实测 41→42，只是词法引用变多）。
				// **度量只应对真实状态敏感，不该对写法敏感。**
				const r = uiSlotCoverage();
				return {
					value: {
						total: r.storeRefsUnassigned.length,
						declared: r.declared,
						assigned: r.assigned,
						storeRefs: r.storeRefs,
						engineBacked: r.engineBacked.length
					},
					detail: r.storeRefsUnassigned.map((rel) => ({ rel }))
				};
			}
		},
		{
			id: 'dom-whitelist-size',
			label: '设计豁免白名单条数（应只减不增）',
			target: 'stable',
			measure() {
				return {
					value: { total: whitelistPatterns.length },
					detail: whitelistPatterns.map((p) => ({ rel: p }))
				};
			}
		},
		{
			id: 'dom-whitelist-unjustified',
			label: '无设计理由的豁免条目（白名单后门检测）',
			target: 'zero',
			measure() {
				// 白名单必须是「有理由才进得来」的清单。加一条 glob 就能绕过 DOM 门禁，
				// 但没有理由的豁免会在 review 里被这条轴立刻顶出来。
				const unjustified = readDomWhitelist().filter((e) => e.reason === null);
				return {
					value: { total: unjustified.length, entries: readDomWhitelist().length },
					detail: unjustified.map((e) => ({ rel: e.pattern }))
				};
			}
		}
	];
}

// ---------------------------------------------------------------------------
// baseline 比对（棘轮）
// ---------------------------------------------------------------------------

/** 展开 value 里的所有数字字段，键形如 `legacy-ui-refs`, `legacy-ui-refs.runtime` */
function flattenMetrics(value) {
	if (typeof value === 'number') return { '': value };
	const out = {};
	for (const [k, v] of Object.entries(value)) {
		if (typeof v === 'number') out[k] = v;
	}
	return out;
}

function loadBaseline() {
	if (!existsSync(BASELINE_FILE)) return null;
	try {
		return JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
	} catch {
		return null;
	}
}

/**
 * 比对。返回 { rows, regressions, improvements, baselineMissing, scanMismatch }
 * 口径变化（scan 段）时**不做棘轮判定**——否则口径一改就会凭空报一堆假回归。
 */
function compare(axes, baseline, scanMeta) {
	const rows = [];
	const regressions = [];
	const improvements = [];
	const baselineAxes = baseline?.axes ?? {};
	const scanMismatch =
		baseline !== null && JSON.stringify(baseline.scan ?? {}) !== JSON.stringify(scanMeta);
	for (const axis of axes) {
		const base = baselineAxes[axis.id]?.value;
		const row = { axis, baseline: base ?? null, regression: false, improved: false };
		if (base !== undefined && base !== null && !scanMismatch) {
			const cur = flattenMetrics(axis.value);
			const old = flattenMetrics(base);
			for (const key of Object.keys(cur)) {
				const before = old[key];
				if (before === undefined) {
					// baseline 里没记过这个子指标：新增即视为上升（例如 runtime 从 0 变有）
					if (cur[key] > 0) {
						row.regression = true;
						regressions.push(
							`${axis.id}${key ? `.${key}` : ''}: （新增）→ ${cur[key]}`
						);
					}
					continue;
				}
				if (cur[key] > before) {
					row.regression = true;
					regressions.push(`${axis.id}${key ? `.${key}` : ''}: ${before} → ${cur[key]}`);
				} else if (cur[key] < before) {
					row.improved = true;
					improvements.push(`${axis.id}${key ? `.${key}` : ''}: ${before} → ${cur[key]}`);
				}
			}
		}
		rows.push(row);
	}
	return { rows, regressions, improvements, scanMismatch };
}

// ---------------------------------------------------------------------------
// 渲染
// ---------------------------------------------------------------------------

const TARGET_MARK = { zero: '归零', stable: '不增', boolean: '翻转' };

function renderValue(value) {
	if (typeof value === 'number') return String(value);
	return Object.entries(value)
		.filter(([, v]) => typeof v === 'number')
		.map(([k, v]) => (k === 'total' ? String(v) : `${k}=${v}`))
		.join(' ');
}

function renderTable(axes, cmp) {
	// 视觉宽度：CJK（码点 > 0x2E80）按 2 列算，其余按 1 列。
	// 用 for-of 逐码点累加，而不是 `[...String(s)]` —— 后者的 spread 会被
	// `typescript/no-misused-spread` 判为「可能拆坏 emoji」，而这里确实只关心码点宽度。
	// （`Intl.Segmenter` 才是"按字素簇"的正确做法，但本表的列宽只需码点级近似。）
	const w = (s) => {
		let n = 0;
		for (const c of String(s)) n += c.charCodeAt(0) > 0x2e80 ? 2 : 1;
		return n;
	};
	const pad = (s, n) => String(s) + ' '.repeat(Math.max(0, n - w(s)));
	// 列值超过列宽时 `pad` 会原样返回、**不留分隔** ⇒ 相邻列的「当前」与「基线」会连成
	// 一串，被读成一个数。实测就有人把 `…engineBacked=7` 后面的 `0 declared=…` 读成了
	// 「engineBacked=70」，并把这个数字抄进了文档。所有列一律带一个尾随空格，杜绝粘连。
	const col = (s, n) => pad(`${String(s)} `, n);
	const idW = Math.max(...axes.map((a) => w(a.id)));
	const labelW = Math.max(...axes.map((a) => w(a.label)));
	const targetW = 6;

	const lines = [];
	lines.push('');
	lines.push('迁移台账（migration-ledger）—— 只许变小');
	lines.push('');
	lines.push(
		`${pad('轴', idW + 2)}${pad('说明', labelW + 2)}${pad('终态', targetW)}${col('当前', 14)}${col('基线', 14)}状态`
	);
	lines.push('-'.repeat(idW + labelW + targetW + 40));
	for (const row of cmp.rows) {
		const { axis } = row;
		let state = '—';
		if (row.regression) state = '✗ 上升';
		else if (row.improved) state = '✓ 下降';
		else if (row.baseline !== null) state = '= 持平';
		lines.push(
			`${pad(axis.id, idW + 2)}${pad(axis.label, labelW + 2)}${pad(TARGET_MARK[axis.target], targetW)}` +
				`${col(renderValue(axis.value), 14)}${col(row.baseline === null ? '(未记录)' : renderValue(row.baseline), 14)}${state}`
		);
	}
	lines.push('');
	return lines.join('\n');
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

function main() {
	const argv = process.argv.slice(2);
	const asJson = argv.includes('--json');
	const check = argv.includes('--check');
	const updateBaseline = argv.includes('--update-baseline');
	const axisFilter = argv.includes('--axis') ? argv[argv.indexOf('--axis') + 1] : null;

	const scanMeta = {
		dirs: SCAN_DIRS.map((d) => d.replace(/\\/g, '/')),
		extensions: ['.ts', '.tsx', '.vue'],
		exclude: '*.spec.ts | *.d.ts | __tests__/ | *.demo.vue',
		source: 'pure-regex (no child_process)'
	};

	const axes = buildAxes();
	const results = axes
		.filter((a) => axisFilter === null || a.id === axisFilter)
		.map((a) => {
			const { value, detail } = a.measure();
			return { id: a.id, label: a.label, target: a.target, value, detail };
		});

	if (axisFilter !== null && results.length === 0) {
		console.error(
			`migration-ledger: 未知轴 "${axisFilter}"。可用：${axes.map((a) => a.id).join(', ')}`
		);
		process.exit(2);
	}

	const baseline = loadBaseline();
	const cmp = compare(results, baseline, scanMeta);

	if (updateBaseline) {
		const payload = {
			version: 1,
			generatedAt: new Date().toISOString(),
			scan: scanMeta,
			axes: Object.fromEntries(
				results
					.slice()
					.sort((a, b) => a.id.localeCompare(b.id))
					.map((r) => [r.id, { label: r.label, target: r.target, value: r.value }])
			)
		};
		writeFileSync(BASELINE_FILE, JSON.stringify(payload, null, '\t') + '\n');
		console.log(
			`migration-ledger: baseline 已更新（${results.length} 轴）→ ${BASELINE_FILE.replace(/\\/g, '/')}`
		);
		for (const r of results) console.log(`  ${r.id}: ${renderValue(r.value)}`);
		return;
	}

	if (asJson) {
		console.log(
			JSON.stringify(
				{
					scan: scanMeta,
					baseline: baseline
						? { generatedAt: baseline.generatedAt, scan: baseline.scan }
						: null,
					regressions: cmp.regressions,
					improvements: cmp.improvements,
					scanMismatch: cmp.scanMismatch,
					axes: results
				},
				null,
				'\t'
			)
		);
		return;
	}

	if (axisFilter !== null) {
		const r = results[0];
		console.log(`\n${r.id} —— ${r.label}（终态：${TARGET_MARK[r.target]}）`);
		console.log(`当前：${renderValue(r.value)}\n`);
		if (r.detail.length === 0) {
			console.log('  （无明细 —— 该轴已归零）');
		} else {
			for (const d of r.detail) {
				const extra = Object.entries(d)
					.filter(([k]) => k !== 'rel' && k !== 'lines')
					.map(([k, v]) => `${k}=${v}`)
					.join(' ');
				console.log(
					`  ${d.rel}${d.lines ? ` (${d.lines} 行)` : ''}${extra ? `  ${extra}` : ''}`
				);
			}
		}
		console.log('');
		return;
	}

	console.log(renderTable(results, cmp));

	if (baseline === null) {
		console.log('提示：尚未建立 baseline。复核上面的数字后用 `--update-baseline` 落盘。\n');
		return;
	}
	if (cmp.scanMismatch) {
		console.log(
			'提示：baseline 的 scan 段与当前口径不一致，本次**跳过棘轮判定**（口径变更不算回归）。\n' +
				'      确认新口径无误后执行 `--update-baseline`。\n'
		);
		return;
	}
	if (cmp.regressions.length > 0) {
		console.log(`✗ 有 ${cmp.regressions.length} 项指标**上升**（棘轮不允许）：`);
		for (const r of cmp.regressions) console.log(`  + ${r}`);
		console.log('');
		console.log(
			'若这是有意的设计变更，请复核后在 PR 里显式执行 `--update-baseline` 并在描述里贴前后对比。\n'
		);
		if (check) process.exit(1);
		return;
	}
	if (cmp.improvements.length > 0) {
		console.log(`✓ ${cmp.improvements.length} 项指标下降：`);
		for (const r of cmp.improvements) console.log(`  - ${r}`);
		console.log('\n提示：合并本次改动时顺手 `--update-baseline`，把进步固化成新基线。\n');
		return;
	}
	console.log('✓ 全部轴与基线持平——无回归。\n');
}

main();
