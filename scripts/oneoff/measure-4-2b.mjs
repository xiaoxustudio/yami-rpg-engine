// 一次性测量：④-2b 的调用点工作单（以 UI 为接收者的引擎方法调用）
// 只读；不做任何写入。用法：node scripts/oneoff/measure-4-2b.mjs [--full]
// 判据：
//   A. 字面量 UI.<镜像>  —— 仅当该文件确实把 UI 当 UI 单例用（import 了遗留模块，或
//      在 ui-engine 系文件里以模块级 UI 引用）。
//   B. this.<镜像>        —— 仅当该文件声明了 `this: UIShape`（静态可分离的 UI 接收者）。
//      其余同名 this.x 是场景/动画/粒子/调色板等各自的同名方法，属假阳性。
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'packages/editor/src';
const FULL = process.argv.includes('--full');
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

function walk(dir, out = []) {
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(ts|vue)$/.test(p)) out.push(p);
	}
	return out;
}

const norm = (p) => relative(process.cwd(), p).replace(/\\/g, '/');
const files = walk(ROOT);
const alt = MIRRORS.join('|');
const reLiteral = new RegExp(`\\bUI\\.(${alt})\\b`, 'g');
const reThis = new RegExp(`\\bthis\\.(${alt})\\b`, 'g');

const srcOf = new Map(files.map((f) => [f, readFileSync(f, 'utf8')]));
const uiReceivers = new Set(files.filter((f) => /this:\s*UIShape\b/.test(srcOf.get(f))));

// 文件里的行号（1-based）+ 整行文本
function at(src, index) {
	const start = src.lastIndexOf('\n', index) + 1;
	const end = src.indexOf('\n', index);
	const line = src.slice(start, end === -1 ? src.length : end);
	return { lineNo: src.slice(0, index).split('\n').length, line: line.trim() };
}

// 噪声判据：注释里的示例（`// UI.x()`）、以及测试文件里对遗留单例的**故意**直连
const isComment = (line) => /^(\/\/|\*|\/\*)/.test(line);
const isTest = (rel) => /(^|\/)(__tests__|.*\.spec\.ts)$/.test(rel);

console.log('=== A. 字面量 UI.<镜像>（逐条确认 UI 是不是 UI 单例） ===');
let aReal = 0;
let aNoise = 0;
const aByFile = new Map();
for (const f of files) {
	const src = srcOf.get(f);
	const rel = norm(f);
	const hits = [];
	for (const m of src.matchAll(reLiteral)) {
		const { lineNo, line } = at(src, m.index);
		if (/^UI\.[\w$]+\s*=\s*UIEngine\./.test(line)) continue; // 镜像定义行本身
		const noise = isComment(line) ? '注释' : isTest(rel) ? '测试文件' : null;
		hits.push({ lineNo, line, name: m[1], noise });
	}
	if (!hits.length) continue;
	const real = hits.filter((h) => !h.noise).length;
	aReal += real;
	aNoise += hits.length - real;
	aByFile.set(rel, real);
	console.log(`\n  ${rel}  (工作点 ${real} / 共 ${hits.length})`);
	const imports = [...src.matchAll(/^import[^\n]*from\s+'([^']+)'/gm)]
		.map((m) => m[1])
		.filter((s) => /ui-window|stores\/ui|engine\/ui/.test(s));
	console.log(`    imports(ui 相关): ${imports.length ? imports.join(', ') : '（无）'}`);
	for (const h of hits) {
		const tag = h.noise ? `  ⤫ 噪声(${h.noise})` : '';
		console.log(`    ${String(h.lineNo).padStart(4)}  ${h.name.padEnd(20)} ${h.line}${tag}`);
	}
}

console.log('\n=== B. this.<镜像> 于「声明了 this: UIShape」的文件（真·UI 接收者） ===');
let bReal = 0;
let bNoise = 0;
const bByFile = new Map();
for (const f of [...uiReceivers].sort((a, b) => a.localeCompare(b))) {
	const src = srcOf.get(f);
	const hits = [];
	for (const m of src.matchAll(reThis)) {
		const { lineNo, line } = at(src, m.index);
		if (/^this\.[\w$]+\s*=\s*(UIEngine|UI)\./.test(line)) continue;
		hits.push({ lineNo, line, name: m[1], noise: isComment(line) ? '注释' : null });
	}
	if (!hits.length) continue;
	const real = hits.filter((h) => !h.noise).length;
	bReal += real;
	bNoise += hits.length - real;
	bByFile.set(norm(f), real);
	console.log(`\n  ${norm(f)}  (工作点 ${real} / 共 ${hits.length})`);
	for (const h of hits) {
		const tag = h.noise ? `  ⤫ 噪声(${h.noise})` : '';
		console.log(`    ${String(h.lineNo).padStart(4)}  ${h.name.padEnd(20)} ${h.line}${tag}`);
	}
}

console.log('\n=== C. 假阳性（同名 this.x，但文件未声明 this: UIShape）—— 排除 ===');
const cByFile = new Map();
for (const f of files) {
	if (uiReceivers.has(f)) continue;
	const n = [...srcOf.get(f).matchAll(reThis)].filter((m) => {
		const { line } = at(srcOf.get(f), m.index);
		return !/^this\.[\w$]+\s*=\s*(UIEngine|UI)\./.test(line);
	}).length;
	if (n) cByFile.set(norm(f), n);
}
const cTotal = [...cByFile.values()].reduce((a, b) => a + b, 0);
for (const [f, n] of [...cByFile].sort((a, b) => b[1] - a[1]))
	console.log(`  ${String(n).padStart(3)}  ${f}`);
if (FULL) console.log(`  （共 ${cByFile.size} 文件 / ${cTotal} 处）`);

console.log('\n=== D. 按**改写形态**分类（第 111 轮新增：④-2b 不是一种改写，是三种） ===');

// `renderingFunction` 的函数体行区间（1-based）。它内部那 7 行是**特殊类**：
// 该函数由 Timer 裸调用（timer.ts:195），`this` 恒为 undefined ⇒ 那 7 行的接收者只能是 UI，
// 不能像别处那样写成 `.call(this)`。判据见 ui-engine.ts:637 那段注释（作者在此连错三次）。
function renderingFnRange(src) {
	const lines = src.split('\n');
	const start = lines.findIndex((l) => /^UIEngine\.renderingFunction\s*=\s*function/.test(l));
	if (start === -1) return null;
	let end = lines.findIndex((l, i) => i > start && l.startsWith('};'));
	if (end === -1) end = lines.length - 1;
	return { start: start + 1, end: end + 1 };
}

const c2 = []; // 字面量 UI.<镜像>，接收者是 UI（可 ⇒ UIEngine.<x>.call(UI, …)）
const c3 = []; // 字面量 UI.<mirror>，落在 renderingFunction 里（接收者不存在，特殊类）
for (const f of files) {
	const src = srcOf.get(f);
	const range = renderingFnRange(src);
	for (const m of src.matchAll(reLiteral)) {
		const { lineNo, line } = at(src, m.index);
		if (/^UI\.[\w$]+\s*=\s*UIEngine\./.test(line)) continue;
		const rel = norm(f);
		if (isComment(line) || isTest(rel)) continue;
		const inRange = range && lineNo >= range.start && lineNo <= range.end;
		(inRange ? c3 : c2).push({ rel, lineNo, name: m[1] });
	}
}

console.log(
	`\n  C1. UI 接收者 this.<镜像>（接收者在手 ⇒ UIEngine.x.call(this, …)）: ${bReal} 处 / ${bByFile.size} 文件`
);
console.log(
	`  C2. 普通方法里的字面量 UI.<镜像>（接收者是 UI ⇒ UIEngine.x.call(UI, …)）: ${c2.length} 处`
);
for (const h of c2) console.log(`        ${h.rel}:${h.lineNo}  ${h.name}`);
console.log(
	`  C3. ⚠️ renderingFunction 里的字面量 UI.<镜像>（接收者不存在，**特殊类**）: ${c3.length} 处`
);
for (const h of c3) console.log(`        ${h.rel}:${h.lineNo}  ${h.name}`);

console.log('\n=== 汇总 ===');
console.log(
	`  A 字面量 UI.<镜像>       : 工作点 ${aReal} / 文件 ${aByFile.size}   （噪声 ${aNoise}：注释 + 测试文件）`
);
console.log(
	`  B UI 接收者 this.<镜像>  : 工作点 ${bReal} / 文件 ${bByFile.size}   （噪声 ${bNoise}）`
);
console.log(
	`  ④-2b 工作单合计          : ${aReal + bReal} 处  =  C1 ${bReal} + C2 ${c2.length} + C3 ${c3.length}`
);
console.log(`  C 排除的假阳性           : ${cTotal} 处 / ${cByFile.size} 文件`);
console.log('\n口径：工作点 = 真的以 UI 为接收者调用的引擎方法（第 103 轮实测 21 + 49 = 70）。');
console.log('      噪声  = 注释里的示例、以及测试文件里**故意**直连遗留单例的调用，不算工作单。');
console.log(
	'      C3    = 唯一「接收者不在手」的一类，见 ui-engine.ts:637 那段注释；改写形态须单独定。'
);
