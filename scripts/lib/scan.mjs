// 共享扫描原语：把「扫哪些文件」「怎么数」这类口径收在一处，供 scripts/ 下的各守卫脚本共用。
//
// 为什么要有这个模块（2026-09-17）：
//   在此之前 `dom-guard.mjs`、`event-surface.mjs`、`migration-ledger.mjs` 各写一份 collectFiles()
//   与各自的计数逻辑。同一个概念（例如「内联匿名监听」）在报表之间会慢慢分叉，而分叉之后
//   **没有任何东西会发现**——这正是白名单双写漂移（.oxlintrc.json vs dom-guard WHITELIST）
//   的同一类病。口径只留一份实现，报表之间就不可能对不上。
//
// 本模块**不 import 任何子进程**：所有函数都是纯文本读取 + 正则。
// 受限环境（沙箱禁止管道 stdio）下 spawn 会 EPERM，纯文本路径永远可用。

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/** 仓库根目录（scripts/lib/ → ../..） */
export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** 默认扫描面：编辑器与组件库的源码 */
export const SCAN_DIRS = [join('packages', 'editor', 'src'), join('packages', 'ui-kit', 'src')];

/** 与 dom-guard 历史口径一致：spec / d.ts / __tests__ / demo 不算存量 */
export const EXCLUDE_RE = /(?:\.spec\.ts$|\.d\.ts$|\/__tests__\/|\.demo\.vue$)/;

const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', 'out', '.git']);

/**
 * 收集扫描文件。
 * @param {object} [opts]
 * @param {string[]} [opts.dirs] 相对 ROOT 的目录列表，默认 SCAN_DIRS
 * @param {boolean} [opts.includeTests] 为 true 时**不排除** spec/__tests__（统计测试内 cast 用）
 * @param {RegExp} [opts.excludeRe] 自定义排除正则，默认 EXCLUDE_RE
 * @returns {{ full: string, rel: string }[]} rel 用 `/` 分隔
 */
export function collectFiles(opts = {}) {
	const dirs = opts.dirs ?? SCAN_DIRS;
	const excludeRe = opts.excludeRe ?? EXCLUDE_RE;
	const files = [];
	for (const dir of dirs) {
		const base = join(ROOT, dir);
		if (!existsSync(base)) continue;
		const walk = (p) => {
			for (const entry of readdirSync(p)) {
				if (SKIP_DIRS.has(entry)) continue;
				const full = join(p, entry);
				const st = statSync(full);
				if (st.isDirectory()) {
					walk(full);
					continue;
				}
				if (!/\.(ts|tsx|vue)$/.test(entry)) continue;
				const rel = relative(ROOT, full).replace(/\\/g, '/');
				if (!opts.includeTests && excludeRe.test(rel)) continue;
				files.push({ full, rel });
			}
		};
		walk(base);
	}
	return files;
}

/** 读文件为 utf8；失败时返回 ''（不抛——扫描脚本不该因为一个坏路径整体失败） */
export function readSource(full) {
	try {
		return readFileSync(full, 'utf8');
	} catch {
		return '';
	}
}

/**
 * 去掉块注释与行注释，保留换行数（便于行号仍然对得上）。
 * 字符串里的 `//` 仍会被吃掉——这是已知的近似，对「数出现次数」的用途可接受。
 */
export function stripComments(src) {
	return src
		.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
		.replace(/\/\/[^\n]*/g, '');
}

/** 全局正则的出现次数（正则自带 /g；不修改传入的 lastIndex 语义外泄） */
export function countMatches(src, re) {
	re.lastIndex = 0;
	let count = 0;
	while (re.exec(src) !== null) count++;
	return count;
}

/**
 * 把源码压成「只剩代码」的形态：注释、字符串字面量、以及 `.vue` 的 template/style 块
 * 全部替换成等长空白（保留换行，行号仍对得上）。
 *
 * 为什么必须有这一步（2026-09-17 实测教训）：本仓库的注释里**大量**出现被迁移掉的旧写法，
 * 例如 `WindowFrame.vue` 的「原先 document.getElementById」、`toast.ts` 的
 * 「原先用 document.querySelector(...) 反查」。按原文正则计数会把这些**已经迁完的**记录
 * 当成迁移债——台账第一版就因此把 `dom-pending` 报成 29 个文件 34 处，而 oxlint 实际是 0。
 * 报表一旦在这种地方虚高，就没人再信它，棘轮也就失去意义。
 *
 * `.vue` 的 template 段被整段跳过：Vue 迁移的终态本来就要求 DOM 由模板渲染，
 * 模板里出现的 `document.*` 必然是字符串/表达式而非真实调用。
 */
export function codeOnly(src) {
	// 1) .vue：跳过 <template> 与 <style>（保留 <script> / <script setup>）
	//    标签本身可能带属性（`<template v-if=…>`），所以匹配用 `<template[\s>]` 而不是 `<template>`，
	//    否则这类块会整段漏掉——第一版就在这里漏了 2 个 HTML 注释里的 `document.createElement`。
	let text = src;
	if (/<template[\s>]/.test(text) || /<style[\s>]/.test(text)) {
		text = text
			.replace(/<template[\s\S]*?<\/template>/g, blankOut)
			.replace(/<style[\s\S]*?<\/style>/g, blankOut);
	}
	// 2) HTML 注释（可能落在 <script> 之外、或块替换的缝隙里）
	text = text.replace(/<!--[\s\S]*?-->/g, blankOut);
	// 3) 逐字符扫描：注释、字符串字面量、**正则字面量**整体置空
	//
	// ⚠️ 正则字面量这一段是 2026-09-19 补的，属于**仪器修复**：
	// 原先只认注释与字符串，遇到 `/["']/` 这类正则时，会把正则里的引号当成字符串开头，
	// 于是**从那里到下一个同类引号之间的所有代码都被置空**（长度保持 ⇒ 行号还对得上，
	// 极难察觉）。实测：全仓 1516 个文件里有 389 个因此被少统计，包括
	// `plugin-parse-meta.ts` 的 8 处 `null as unknown as` 全部消失、
	// `window-cluster.ts` 的 21 处 `window.` 归零 —— 也就是说
	// **null-casts 轴与 DOM 门禁对这批文件一直是瞎的**。
	const out = text.split('');
	let i = 0;
	const n = text.length;
	// 记录「上一个有意义的字符/标识符」，用来判断 `/` 是正则还是除号
	let prevCh = '';
	let prevWord = '';
	while (i < n) {
		const ch = text[i];
		const next = text[i + 1];
		if (ch === '/' && next === '/') {
			const end = text.indexOf('\n', i);
			const stop = end === -1 ? n : end;
			for (let k = i; k < stop; k++) if (out[k] !== '\n') out[k] = ' ';
			i = stop;
			continue;
		}
		if (ch === '/' && next === '*') {
			const end = text.indexOf('*/', i + 2);
			const stop = end === -1 ? n : end + 2;
			for (let k = i; k < stop; k++) if (out[k] !== '\n') out[k] = ' ';
			i = stop;
			continue;
		}
		if (ch === '/' && regexAllowed(prevCh, prevWord)) {
			// 扫描到闭合 `/`：跳过转义，字符类 `[...]` 里的 `/` 不算结束；正则不跨行
			let k = i + 1;
			let inClass = false;
			while (k < n) {
				const c = text[k];
				if (c === '\\') {
					k += 2;
					continue;
				}
				if (c === '\n') break;
				if (c === '[') inClass = true;
				else if (c === ']') inClass = false;
				else if (c === '/' && !inClass) {
					k++;
					break;
				}
				k++;
			}
			if (k <= n && text[k - 1] === '/') {
				for (let j = i; j < k; j++) if (out[j] !== '\n') out[j] = ' ';
				i = k;
				prevCh = '/';
				prevWord = '';
				continue;
			}
		}
		if (ch === "'" || ch === '"' || ch === '`') {
			let k = i + 1;
			while (k < n) {
				if (text[k] === '\\') {
					k += 2;
					continue;
				}
				if (text[k] === ch) break;
				k++;
			}
			const stop = Math.min(k + 1, n);
			for (let j = i; j < stop; j++) if (out[j] !== '\n') out[j] = ' ';
			i = stop;
			prevCh = ch;
			prevWord = '';
			continue;
		}
		if (!/\s/.test(ch)) {
			if (/[A-Za-z0-9_$]/.test(ch))
				prevWord = /[A-Za-z0-9_$]/.test(prevCh) ? prevWord + ch : ch;
			else prevWord = '';
			prevCh = ch;
		}
		i++;
	}
	return out.join('');

	/**
	 * `/` 能否开启正则字面量？
	 * 只在「表达式可以开始」的位置可以：文件/语句开头、运算符、`(`/`,`/`=`/`:`/`[`/`!`/`&`/`|`/`?`/`{`/`;` 之后，
	 * 以及 `return`/`typeof` 等关键字之后。跟在标识符、数字、`)`、`]` 之后的 `/` 是除号。
	 */
	function regexAllowed(pc, pw) {
		if (pc === '') return true;
		if (/[)\]]/.test(pc)) return false;
		if (/[A-Za-z0-9_$]/.test(pc)) {
			return /^(?:return|typeof|instanceof|in|of|new|delete|void|do|else|case|yield|await)$/.test(
				pw
			);
		}
		return true;
	}

	function blankOut(match) {
		return match.replace(/[^\n]/g, ' ');
	}
}

/** 只数「真实代码」里的受限 API 命中（排除注释与字符串） */
export function countCodeMatches(src, re) {
	return countMatches(codeOnly(src), re);
}

// ---------------------------------------------------------------------------
// 受限 DOM API（与 .oxlintrc.json 的 no-restricted-properties 对齐）
// ---------------------------------------------------------------------------

/**
 * 受限 API 模式。`lint: true` 的项在 .oxlintrc.json 里有对应的 lint 规则，
 * 因此「带豁免注释且仍有命中」才算迁移债（见 migration-ledger 的 dom-pending 轴）。
 */
export const DOM_PATTERNS = [
	// 按「属性访问」计数：不能要求后面紧跟 '('——`document.querySelector<HTMLElement>(...)`
	// 这类带类型实参的写法会漏计。
	{ key: 'getElementById', re: /document\s*\.\s*getElementById\b/g, lint: true },
	{ key: 'querySelector', re: /document\s*\.\s*querySelector(?:All)?\b/g, lint: true },
	{ key: 'getElementsByClass', re: /document\s*\.\s*getElementsByClassName\b/g, lint: true },
	{ key: 'getElementsByName', re: /document\s*\.\s*getElementsByName\b/g, lint: true },
	{ key: 'getElementsByTag', re: /document\s*\.\s*getElementsByTagName\b/g, lint: true },
	{ key: 'createElement', re: /document\s*\.\s*createElement\b/g, lint: true },
	{ key: 'appendChild', re: /\.appendChild\s*\(/g },
	{ key: 'removeChild', re: /\.removeChild\s*\(/g },
	{ key: 'insertBefore', re: /\.insertBefore\s*\(/g },
	{ key: 'parentNode', re: /\.parentNode\b/g },
	{ key: 'innerHTML', re: /\.innerHTML\b/g },
	{ key: 'addEventListener', re: /\.addEventListener\s*\(/g },
	{ key: 'dispatchEvent', re: /\.dispatchEvent\s*\(/g },
	// element-utils 的 jQuery 风格寻址与字符串模板建 DOM——不在 lint 规则内，但同属待迁移耦合
	{ key: 'dollarLookup', re: /\$\(\s*['"\u0060]#/g },
	{ key: 'domParser', re: /new DOMParser\(\)/g },
	{ key: 'protoExt', re: /(?:HTMLElement|Element|ChildNode|ParentNode)\.prototype\./g }
];

/** 受限 DOM API 判定的豁免注释（与 .oxlintrc.json 的 lint 规则名对齐） */
export const DOM_DISABLE_RE = /\/\* oxlint-disable((?:[^*]|\*+(?!\/))*)\*\//g;

/** 文件是否带「关闭 no-restricted-properties」的 oxlint 块注释 */
export function hasDomExemption(src) {
	DOM_DISABLE_RE.lastIndex = 0;
	let m;
	while ((m = DOM_DISABLE_RE.exec(src)) !== null) {
		const names = m[1];
		if (names.trim() === '' || names.includes('no-restricted-properties')) return true;
	}
	return false;
}

// ---------------------------------------------------------------------------
// 事件面
// ---------------------------------------------------------------------------

/**
 * 浏览器原生事件（其余视为应用自定义事件）。
 *
 * ⚠️ 这是**唯一一份**：`scripts/event-surface.mjs` 原先自带一份逐字相同的 `NATIVE` 集合
 * （2026-09-21 合并到这里）。两份列表是「事件面报表把哪些事件算成自定义事件」的口径，
 * 分叉一次就会让报表数字与门禁对不上 —— 本仓已有 `dom-guard` / `migration-ledger` 分叉的
 * 前车之鉴，所以口径一律只维护一份。
 */
export const NATIVE_EVENTS = new Set([
	'pointerup',
	'pointermove',
	'pointerdown',
	'pointercancel',
	'keydown',
	'keyup',
	'keypress',
	'resize',
	'blur',
	'focus',
	'error',
	'unhandledrejection',
	'beforeunload',
	'dragenter',
	'dragover',
	'dragleave',
	'drop',
	'dragstart',
	'dragend',
	'click',
	'dblclick',
	'wheel',
	'contextmenu',
	'message',
	'online',
	'offline',
	'scroll',
	'visibilitychange',
	'closed'
]);

/**
 * 逐条取出 `TARGET.addEventListener(...)` 的整段调用文本（按括号配对），
 * 判断该监听是否**内联匿名**、以及是否带 `{ once: true }`。
 *
 * `{ once: true }` 的监听由浏览器在首次触发后自动摘除，因此不算「没有 remove」的生命周期风险
 * ——不区分就会把它们误记为风险点，这里保留该区分。
 *
 * @param {string} rawSrc 文件原文
 * @param {string} [target] 调用前缀，默认 `window`（函数内部拼成 `${target}.addEventListener(`）
 * @returns {{ once: boolean, inline: boolean }[]}
 */
export function scanAddListenerCalls(rawSrc, target = 'window') {
	// 先去注释：注释与字符串里也会出现 `window.addEventListener(`，按原文扫描会把整段无关代码
	// 当成一次调用（曾因此把「内联匿名监听」数高估了）。
	const src = stripComments(rawSrc);
	const marker = `${target}.addEventListener(`;
	const calls = [];
	let index = src.indexOf(marker);
	while (index !== -1) {
		let depth = 0;
		let i = index + marker.length - 1;
		let text = '';
		for (; i < src.length; i++) {
			const ch = src[i];
			text += ch;
			if (ch === '(') depth++;
			else if (ch === ')') {
				depth--;
				if (depth === 0) break;
			}
		}
		calls.push({
			once: /\bonce\s*:\s*true\b/.test(text),
			// text 从调用自身的 `(` 开始 ⇒ 实参要从下标 1 起算
			inline: /^\s*['"][\w:-]+['"]\s*,\s*(?:\(|function\s*\()/.test(text.slice(1))
		});
		index = src.indexOf(marker, i);
	}
	return calls;
}

/**
 * 「无法 remove」的监听：内联匿名 **且** 非 once。
 * @returns {{ count: number, files: [string, number][] }} files 按处数降序
 */
export function unremovableListeners(files, target = 'window') {
	let count = 0;
	const perFile = [];
	for (const { full, rel } of files) {
		const n = scanAddListenerCalls(readSource(full), target).filter(
			(c) => c.inline && !c.once
		).length;
		if (n > 0) {
			count += n;
			perFile.push([rel, n]);
		}
	}
	perFile.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
	return { count, files: perFile };
}

// ---------------------------------------------------------------------------
// import 语句：运行时 vs 仅类型
// ---------------------------------------------------------------------------

const IMPORT_RE = /^\s*import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/gm;

/**
 * `export … from '…'` 形式的**再导出**。
 *
 * 2026-09-21 补：它是一条**静态运行时依赖**，与 `import … from` 等价 ——
 * `tools/window-cluster.ts` 正是用 `export { UI } from '@app/engine/ui/legacy/ui-window.ts'`
 * 把遗留 UI 单例转出去的。旧口径只认 `import`，于是那条依赖在任何引用计数里都不存在：
 * 阶段 1c 纯搬运之后，`legacy-ui-refs` 轴读到 **0**，看起来像「遗留层已经没人用了」——
 * 而真正的引用一直在（只是换成了再导出）。**仪器漏掉一种写法，读数就会假装变好。**
 */
const REEXPORT_RE = /^\s*export\s+(type\s+)?(\*|\{[\s\S]*?\})\s+from\s+['"]([^'"]+)['"]/gm;

/**
 * 收集一个文件里所有静态 import **与再导出**。
 *
 * `typeOnly` 的判定是启发式的，覆盖三种写法：
 *   `import type { X } from …` / `import { type X } from …`（具名全带 type）/ `import type X from …`。
 * 混合写法（`import { Foo, type Bar }`）判为**运行时**——保守方向：宁可把它算成运行时，
 * 也不要把真正的运行时依赖算漏（否则「拆掉遗留层」的进度会虚高）。
 *
 * @returns {{ specifier: string, typeOnly: boolean, kind: 'import' | 'reexport', text: string }[]}
 */
export function collectImports(src) {
	const out = [];
	const collect = (re, kind) => {
		re.lastIndex = 0;
		let m;
		while ((m = re.exec(src)) !== null) {
			const [, typeKeyword, clause, specifier] = m;
			let typeOnly = Boolean(typeKeyword);
			if (!typeOnly && kind === 'import') {
				const braces = clause.match(/\{([\s\S]*)\}/);
				if (braces) {
					const names = braces[1]
						.split(',')
						.map((s) => s.trim())
						.filter((s) => s !== '');
					typeOnly = names.length > 0 && names.every((n) => /^type\s/.test(n));
				}
			}
			out.push({
				specifier,
				typeOnly,
				kind,
				text: m[0].replace(/\s+/g, ' ').trim()
			});
		}
	};
	collect(IMPORT_RE, 'import');
	collect(REEXPORT_RE, 'reexport');
	return out;
}

/** 匹配 specifier 的 import 计数，分运行时/仅类型 */
export function importRefs(files, specifierRe) {
	let total = 0;
	let runtime = 0;
	const perFile = [];
	for (const { full, rel } of files) {
		const hits = collectImports(readSource(full)).filter((i) => specifierRe.test(i.specifier));
		if (hits.length === 0) continue;
		const rt = hits.filter((h) => !h.typeOnly).length;
		total += hits.length;
		runtime += rt;
		perFile.push({ rel, total: hits.length, runtime: rt, typeOnly: hits.length - rt });
	}
	perFile.sort((a, b) => b.runtime - a.runtime || a.rel.localeCompare(b.rel));
	return { total, runtime, perFile };
}

// ---------------------------------------------------------------------------
// 遗留单例形状（null as unknown as / as unknown as / 泛型逃生口 / UI 成员挂载）
// ---------------------------------------------------------------------------

/** `null as unknown as` —— 遗留单例「先声明 null 再 cast 回真类型」的形状 */
export const NULL_CAST_RE = /\bnull\s+as\s+unknown\s+as\b/g;
/** 任意双重断言 */
export const UNKNOWN_CAST_RE = /\bas\s+unknown\s+as\b/g;
/**
 * 泛型逃生口：`[k: string]: any` / `[key: string]: any`，以及 `Record<string, any>`。
 *
 * ⚠️ `Record<string, any>` 是 2026-09-20 补进口径的（此前只数索引签名）。它和索引签名是
 * **同一个逃生的两种写法**：都让类型检查在该形状上失效。只数一种的话，把
 * `[k: string]: any` 改写成 `Record<string, any>` 就能凭空「归零」——这正是本仓反复
 * 强调的「度量必须对真实状态敏感，而不是对写法敏感」。
 * 实测：索引签名 32 处 + `Record<string, any>` 35 处 = **67 处**（口径扩展当轮）。
 */
export const ANY_HATCH_RE = /(?:\[(?:k|key):\s*string\]:\s*any\b|Record<string,\s*any>)/g;

/**
 * 遗留 `UI` 单例的**成员挂载点**：`UI.<name> = …`。
 *
 * 这是 `legacy-ui-lines` 的**替代轴**口径，用来补一个已实测的度量漏洞：
 * `legacy-ui-lines` 数的是 `packages/editor/src/ui/` 这个**目录**的行数，于是把 8 个域模块
 * 「原样搬到」`engine/ui/` 就会让它立刻读到 0，而遗留代码**一行都没少**——棘轮当场失明。
 * 本口径**不受目录影响**，纯移动不会让它下降，只有真正把成员迁走才会。
 *
 * ⚠️ `(?!=)` 不是装饰：裸的 `\s*=` 会把 `UI.dragging === null`（`ui-events.ts:80`）
 * 误判成一次赋值，而那是**只读**。实测：裸正则 104 处 → 加 `(?!=)` **103 处**。
 *
 * 另注：行首锚定的 grep（`^UI\.`）数不到链式赋值
 * `uiElClasses.createElement = UI.createElement = …`（`ui-prefab.ts:105`），
 * 所以 `\b` 边界 + `codeOnly` 才是正确口径，不要用「行首」近似。
 */
export const UI_SINGLETON_RE = /\bUI\.[A-Za-z_$][\w$]*\s*=(?!=)/g;

/**
 * 2026-09-21：删掉了四个零引用的导出 —— `filesMatching` / `countByFile` / `countAll` /
 * `escapeRegExp`。全仓（含 `scripts/` 自身）都只有它们的**定义行**，没有任何调用点。
 * 死导出比死文件更隐蔽：它看起来像「公共工具」，下一个人会照着它写第二份实现。
 *
 * 同轮把 `NATIVE_EVENTS` 从「死导出」变成唯一真源（`event-surface.mjs` 自带的那份已合并进来）。
 */
