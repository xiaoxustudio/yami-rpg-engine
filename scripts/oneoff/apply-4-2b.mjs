// 一次性改写：阶段 1c 第 ④-2b 步 —— 把「以 UI 为接收者」的引擎方法调用改为直连 UIEngine。
// 用法：node scripts/oneoff/apply-4-2b.mjs [--dry]
//
// ⚠️ **已于 2026-09-22 第 112 轮执行完毕**（70 处，随该轮提交入库）。保留它是为了**可审计**：
//    它逐条记着「哪一处从什么改成什么」的形态与条数。重复执行会因各文件预期条数对不上而
//    **整体中止**（见文件末尾）—— 那是**设计**，不是缺陷。要重做请先跑 measure-4-2b.mjs 确认工作单。
//
// 判据（与 measure-4-2b.mjs 同源，改写前先跑它确认工作单是 70 = 49 + 14 + 7）：
//   · 只改这 8 个文件（工作单所在处），别处同名 this.x 是场景/动画/粒子等的假阳性；
//   · 跳过注释行（ui-engine.ts 的警告注释里就写着 `UI.drawXxx()` 这类示例）；
//   · `X.name!(args)` → `UIEngine.name!.call(X, args)`，X ∈ { this, UI }；
//   · `UI.name?.(args)`（LayoutPanel 那处）→ `UIEngine.name!.call(UI, args)`；
//   · `this.renderingFunction`（值引用，不是调用）→ `UIEngine.renderingFunction`：镜像就是
//     同一个函数对象，Timer 拿它去裸调用，行为不变。
// 每处都断言预期条数，对不上就整体中止，绝不「改一半」。
import { readFileSync, writeFileSync } from 'node:fs';

const DRY = process.argv.includes('--dry');

const MIRRORS = [
	'setZoom',
	'shiftAnchor',
	'shiftTarget',
	'resizeTarget',
	'rotateTarget',
	'setControlPoint',
	'updateControlPoints',
	'getPointerCoords',
	'updateCamera',
	'updateTransform',
	'drawBackground',
	'drawElements',
	'drawCoordinateAxes',
	'drawHoverWireframe',
	'drawTargetWireframe',
	'drawTargetAnchor',
	'drawControlPoints',
	'selectControlPoint',
	'requestRendering',
	'renderingFunction',
	'stopRendering'
];

// 预期改写条数：[this 接收者的调用, UI 接收者的调用, 值引用]
const TARGETS = [
	['packages/editor/src/engine/ui/ui-engine.ts', 5, 7, 2],
	['packages/editor/src/engine/ui/ui-events.ts', 14, 2, 0],
	['packages/editor/src/engine/ui/ui-file.ts', 2, 0, 0],
	['packages/editor/src/engine/ui/ui-initialize.ts', 4, 5, 0],
	['packages/editor/src/engine/ui/ui-list.ts', 0, 3, 0],
	['packages/editor/src/engine/ui/ui-pointer.ts', 12, 0, 0],
	['packages/editor/src/engine/ui/ui-transform.ts', 10, 3, 0],
	['packages/editor/src/components/layout/LayoutPanel.vue', 0, 1, 0]
];

const isComment = (line) => /^\s*(\/\/|\*|\/\*)/.test(line);
const mirrorAlt = MIRRORS.join('|');

/** 从 `(` 的下标出发，返回配对 `)` 的下标（按深度计数）。 */
function matchParen(src, openIdx) {
	let depth = 0;
	for (let i = openIdx; i < src.length; i++) {
		const ch = src[i];
		if (ch === '(') depth++;
		else if (ch === ')') {
			depth--;
			if (depth === 0) return i;
		}
	}
	throw new Error(`括号不配对（openIdx=${openIdx}）`);
}

/** 该下标是否落在 `UIEngine.renderingFunction = function … };` 的函数体内。 */
function inRenderingFunction(src, idx) {
	const start = src.search(/^UIEngine\.renderingFunction\s*=\s*function/m);
	if (start === -1) return false;
	const endRel = src.slice(start).search(/^\};/m);
	const end = endRel === -1 ? src.length : start + endRel;
	return idx > start && idx < end;
}

let grand = { this: 0, ui: 0, value: 0 };
const errors = [];

for (const [rel, expectThis, expectUi, expectValue] of TARGETS) {
	let src = readFileSync(rel, 'utf8');
	let nThis = 0;
	let nUi = 0;
	let nValue = 0;

	// ── 1. 调用形态：this.name(...) / UI.name(...) / UI.name?.(...)
	for (const recv of ['this', 'UI']) {
		const re = new RegExp(`\\b${recv}\\.(${mirrorAlt})\\s*(!|\\?\\.)?\\s*\\(`, 'g');
		// 从后往前替换，避免下标漂移
		const hits = [...src.matchAll(re)].reverse();
		for (const m of hits) {
			const at = m.index;
			// 注释行跳过
			const lineStart = src.lastIndexOf('\n', at) + 1;
			const lineEnd = src.indexOf('\n', at);
			const line = src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
			if (isComment(line)) continue;
			// 镜像定义行（ui-window.ts）不在目标文件里，但双保险
			if (/=\s*UIEngine\.[\w$]+\s*;/.test(line)) continue;

			const name = m[1];
			const openIdx = src.indexOf('(', at + m[0].length - 1);
			const closeIdx = matchParen(src, openIdx);
			const args = src.slice(openIdx + 1, closeIdx);
			if (inRenderingFunction(src, at) && recv === 'this') {
				errors.push(
					`${rel}: renderingFunction 内出现 this.${name}(…) —— 接收者不存在，必须用 UI`
				);
			}
			const call = args.trim().length
				? `UIEngine.${name}!.call(${recv}, ${args})`
				: `UIEngine.${name}!.call(${recv})`;
			src = src.slice(0, at) + call + src.slice(closeIdx + 1);
			if (recv === 'this') nThis++;
			else nUi++;
		}
	}

	// ── 2. 值引用：this.renderingFunction（后面不跟 `(`）
	{
		const re = /\bthis\.renderingFunction\b(?!\s*\()/g;
		const hits = [...src.matchAll(re)].reverse();
		for (const m of hits) {
			const lineStart = src.lastIndexOf('\n', m.index) + 1;
			const lineEnd = src.indexOf('\n', m.index);
			const line = src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
			if (isComment(line)) continue;
			src =
				src.slice(0, m.index) +
				'UIEngine.renderingFunction' +
				src.slice(m.index + m[0].length);
			nValue++;
		}
	}

	const ok = nThis === expectThis && nUi === expectUi && nValue === expectValue;
	console.log(
		`${ok ? '✓' : '✗'} ${rel}  this:${nThis}/${expectThis}  UI:${nUi}/${expectUi}  值引用:${nValue}/${expectValue}`
	);
	if (!ok) errors.push(`${rel}: 改写条数与预期不符`);
	grand.this += nThis;
	grand.ui += nUi;
	grand.value += nValue;
	if (!DRY && ok) writeFileSync(rel, src, 'utf8');
}

console.log(
	`\n合计：this 接收者 ${grand.this} · UI 接收者 ${grand.ui} · 值引用 ${grand.value} = ${grand.this + grand.ui + grand.value} 处` +
		`（预期 70）${DRY ? '  [--dry：未写入]' : ''}`
);
if (errors.length) {
	console.error('\n中止，未写入任何文件：');
	for (const e of errors) console.error(`  · ${e}`);
	process.exit(1);
}
if (grand.this + grand.ui + grand.value !== 70) {
	console.error(
		`\n中止：合计 ${grand.this + grand.ui + grand.value} ≠ 70（工作单变了，先重跑 measure-4-2b.mjs）`
	);
	process.exit(1);
}
