/**
 * 技法 6（默认 dry-run）：删除**赋值形态**的占位谎言
 *
 *   Animation.list.copy = null as unknown as (...args: unknown[]) => any;
 *   // oxlint-disable-next-line no-explicit-any        ← 连注释一起删，否则变成陈旧豁免
 *
 * ## 为什么可以删
 *
 * 这些槽位的类型来自元素/单例接口声明，**赋值语句本身不参与类型**，所以删掉不会产生类型错误。
 * 运行期唯一的差别是：属性从「存在且为 `null`」变成「不存在（`undefined`）」。
 * 对这个差别敏感只有三种读法，均已全仓核对（递归检索，不是目录 + `-Include` 那种假阴性写法）：
 *   - `X.slot === null` / `!== null` —— 无命中
 *   - `Object.keys` / `for…in` 枚举这些 list 对象 —— 无命中
 *   - 真值判断（`if (X.slot)` / `X.slot?.()`）—— `null` 与 `undefined` 同为假，行为一致
 *
 * ## 删除的**前置条件**（工具自己会把关，不满足就不删）
 *
 * 全仓必须存在该属性的**真实写入方**。否则说明这个槽位从来没被填过 ——
 * 那是个隐藏缺陷（调用点会从 `null is not a function` 变成 `undefined is not a function`，
 * 同样炸），不能当成「清理干净」而悄悄删掉，要单独报出来。
 *
 * ## 不处理声明形态
 *
 * `let x = null as unknown as T;` 是**声明**，不能整行删（会连声明一起删掉）。
 * 那一类要改成 `let x: T;` 或放宽成 `| null`，属另一套处理，本工具跳过并报出。
 *
 * 用法：node scripts/lazy-slot-assign-codemod.mjs [--apply]
 *   （或 pnpm migration:lazy-slots-assign）
 */
import { writeFileSync } from 'node:fs';
import { collectFiles, readSource, SCAN_DIRS } from './lib/scan.mjs';

const APPLY = process.argv.slice(2).includes('--apply');

/** 占位赋值行：**必须顶格**（模块顶层），且排除 const/let/var 声明形态。
 *
 *  ⚠️ 为什么必须顶格 —— 这是本工具第一版**真实犯过的错**：
 *  缩进的 `X.field = null as unknown as T;` 有两种截然不同的语义：
 *    - 挂载函数里的**预声明**（后面紧跟 binder 赋真值）⇒ 删掉安全；
 *    - 函数里的**状态重置**（`this.context = null; … this.emitter = null;`）⇒ 删掉**不安全**：
 *      字段会保留旧值。实测踩到 5 处：`YMParamList` 的 `self.start`（全文件 20 多处
 *      `if (self.start !== null)`，清空失败会让旧选区复活）、`Particle.close()` 的
 *      `this.emitter`、`UI.close()` 的 `this.history`、`plugin-parse-meta` 重置块的
 *      `overview/parameters/manager`、以及 `if (this.noWindow){ this.load = null; … }`
 *      这种**故意禁用**（删掉后 noWindow 的 schema 会回落到原型方法）。
 *  两者靠静态分析分不开，所以工具**只动顶格的**，缩进的只报出来交人工。
 */
const PLACEHOLDER_RE =
	/^(?!(?:const|let|var)\b)([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\([^()\n]*\))*)\s*=\s*null\s+as\s+unknown\s+as\b[^\n]*;[ \t\r]*$/;
/** 缩进的同类语句：只报告，不删 */
const INDENTED_RE =
	/^[ \t]+(?!(?:const|let|var)\b)([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\([^()\n]*\))*)\s*=\s*null\s+as\s+unknown\s+as\b[^\n]*;[ \t\r]*$/;
const DECL_RE = /^[ \t]*(?:const|let|var)\s/;
const DISABLE_COMMENT_RE =
	/^[ \t]*\/\/[ \t]*oxlint-disable-next-line[ \t]+no-explicit-any[ \t\r]*$/;

const files = collectFiles({ dirs: SCAN_DIRS });
const sources = files.map((f) => ({
	rel: f.rel,
	full: f.full,
	lines: readSource(f.full).split('\n')
}));

/** 全仓是否存在该属性的真实写入方（RHS 不是 null-cast 的赋值） */
function hasWriter(prop, selfRel, selfLine) {
	const re = new RegExp(
		`\\.${prop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*=\\s*(?!null\\s+as\\s+unknown)`
	);
	for (const s of sources) {
		for (let i = 0; i < s.lines.length; i++) {
			if (s.rel === selfRel && i === selfLine - 1) continue;
			if (re.test(s.lines[i])) return `${s.rel}:${i + 1}`;
		}
	}
	return null;
}

const deletable = [];
const noWriter = [];
const declForms = [];
const indented = [];

for (const s of sources) {
	for (let i = 0; i < s.lines.length; i++) {
		const line = s.lines[i];
		if (DECL_RE.test(line) && /null\s+as\s+unknown\s+as/.test(line)) {
			declForms.push({ rel: s.rel, line: i + 1, text: line.trim().slice(0, 96) });
			continue;
		}
		// 缩进的同类语句：可能是重置/故意禁用，**只报告不删**
		if (INDENTED_RE.test(line)) {
			indented.push({ rel: s.rel, line: i + 1, text: line.trim().slice(0, 96) });
			continue;
		}
		const m = PLACEHOLDER_RE.exec(line);
		if (!m) continue;
		const prop = m[1].split('.').pop().replace(/\(.*$/, '');
		const writer = hasWriter(prop, s.rel, i + 1);
		if (!writer) {
			noWriter.push({ rel: s.rel, line: i + 1, text: line.trim().slice(0, 96) });
			continue;
		}
		// 紧邻上一行的 no-explicit-any 豁免注释一并删除（否则会成为陈旧豁免）
		const alsoComment = i > 0 && DISABLE_COMMENT_RE.test(s.lines[i - 1]);
		deletable.push({ rel: s.rel, full: s.full, line: i + 1, alsoComment, prop, writer });
	}
}

console.log('');
console.log('技法 6 dry-run：删除赋值形态占位（声明形态另计）');
console.log('-------------------------------------------------------------------------');
const byFile = new Map();
for (const d of deletable) {
	if (!byFile.has(d.rel)) byFile.set(d.rel, []);
	byFile.get(d.rel).push(d);
}
for (const [rel, list] of [...byFile].sort((a, b) => b[1].length - a[1].length)) {
	const cm = list.filter((d) => d.alsoComment).length;
	console.log(
		`  ${String(list.length).padStart(3)}  ${rel}${cm ? `   (含 ${cm} 条豁免注释)` : ''}`
	);
}
console.log('-------------------------------------------------------------------------');
console.log(
	`可删除：${deletable.length} 行（另有 ${deletable.filter((d) => d.alsoComment).length} 条豁免注释）`
);
console.log(`找不到写入方（**不删**，单独报出）：${noWriter.length}`);
for (const n of noWriter) console.log(`  ⚠️ ${n.rel}:${n.line}  ${n.text}`);
console.log(`声明形态（本工具不处理）：${declForms.length}`);
for (const n of declForms) console.log(`  · ${n.rel}:${n.line}  ${n.text}`);
console.log('');
console.log(`⚠️ 缩进的同类语句（**只报告不删**：可能是状态重置或故意禁用）：${indented.length}`);
for (const n of indented) console.log(`  ! ${n.rel}:${n.line}  ${n.text}`);

if (APPLY) {
	console.log('');
	console.log('--- 应用 ---');
	const byFileDel = new Map();
	for (const d of deletable) {
		if (!byFileDel.has(d.full)) byFileDel.set(d.full, new Set());
		byFileDel.get(d.full).add(d.line);
		if (d.alsoComment) byFileDel.get(d.full).add(d.line - 1);
	}
	for (const [full, lineSet] of byFileDel) {
		const src = readSource(full);
		const lines = src.split('\n');
		const kept = lines.filter((_, i) => !lineSet.has(i + 1));
		writeFileSync(full, kept.join('\n'), 'utf8');
		console.log(
			`  ✅ ${full.replace(/\\/g, '/').split('/src/')[1] ?? full}  -${lineSet.size} 行`
		);
	}
	console.log(
		`共改写 ${byFileDel.size} 个文件，删除 ${[...byFileDel.values()].reduce((s, v) => s + v.size, 0)} 行`
	);
} else {
	console.log('');
	console.log('（只读模式。加 --apply 执行）');
}
