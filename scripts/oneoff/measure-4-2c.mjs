// 一次性测量：阶段 1c 第 ④-2c 步（删 ui-window.ts 的 21 行镜像）**动手前**要回答的问题。
// 只读。用法：node scripts/oneoff/measure-4-2c.mjs
//
// 问题一：删掉 21 行镜像，`ui-slot-coverage` 会不会反而上升？
//         该轴的 `storeRefsUnassigned` = store 引用了、但全仓没人赋值的槽位。
//         而 `assignedSlots()` 把遗留目录里的 `UI.x = …` **也算赋值** ⇒ 镜子一删，
//         若那批名字仍在 store 的引用集合里，`total` 就会 0 → N（撞棘轮）。
// 问题二：除了 70 处调用点，还有谁**按名字动态**取这些镜像（文本扫描看不见的）？

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
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

const { assignedSlots, storeReferencedSlots, uiSlotCoverage } = await import(
	pathToFileURL(join(ROOT, 'scripts/lib/ui-slots.mjs')).href
);

const refs = storeReferencedSlots();
const assigned = assignedSlots();
const cov = uiSlotCoverage();

console.log(
	`镜像 ${MIRRORS.length} 个；store 引用槽位 ${refs.size} 个；全仓已赋值 ${assigned.size} 个。`
);
console.log(`当前 storeRefsUnassigned = ${cov.storeRefsUnassigned.length}（轴 total，终态 0）`);
console.log(`engineBacked（实现就在 ui-engine.ts 里，可上升）= ${cov.engineBacked.length}`);
console.log(`  ${cov.engineBacked.join(', ')}`);

// ── 问题一：模拟「21 行镜像被删」之后的 storeRefsUnassigned
const mirrorInRefs = MIRRORS.filter((m) => refs.has(m));
const mirrorInAssigned = MIRRORS.filter((m) => assigned.has(m));
const mirrorBoth = MIRRORS.filter((m) => refs.has(m) && assigned.has(m));
console.log(`\n[问题一]`);
console.log(
	`  21 个镜子里，在 store 引用集合里的      ：${mirrorInRefs.length}  ${mirrorInRefs.join(', ') || '（无）'}`
);
console.log(
	`  21 个镜子里，被 assignedSlots 算作赋值的：${mirrorInAssigned.length}  ${mirrorInAssigned.join(', ') || '（无）'}`
);
console.log(
	`  两者交集（删镜像后**会变成**「引用了但没人赋值」）：${mirrorBoth.length}  ${mirrorBoth.join(', ') || '（无）'}`
);
console.log(
	`  ⇒ 删镜像后 storeRefsUnassigned 预计 = ${cov.storeRefsUnassigned.length + mirrorBoth.length}` +
		`  ${mirrorBoth.length === 0 ? '（安全）' : '⚠️ **上升，会撞棘轮**'}`
);
const engineBackedSet = new Set(cov.engineBacked);
console.log(
	`  其中属于 engineBacked 的：${mirrorBoth.filter((m) => engineBackedSet.has(m)).length} / ${mirrorBoth.length}` +
		`  ${mirrorBoth.length && mirrorBoth.every((m) => engineBackedSet.has(m)) ? '⇒ 全部是「引擎自实现」，只是这条轴没把 engineBacked 排除掉' : ''}`
);

// ── 问题二：动态按名字取镜像的地方（(a) 直接文本、(b) 字符串键 / 枚举 / 展开）
function walk(dir, out = []) {
	for (const e of readdirSync(dir)) {
		const p = join(dir, e);
		if (statSync(p).isDirectory()) walk(p, out);
		else if (/\.(ts|vue)$/.test(p)) out.push(p);
	}
	return out;
}
const files = walk(join(ROOT, 'packages/editor/src'));
const mirrorAlt = MIRRORS.join('|');

console.log(`\n[问题二]`);
// (a) 文本里还有 `UI.<镜像>` 的地方（排除镜像定义行）
const textHits = [];
for (const f of files) {
	const src = readFileSync(f, 'utf8');
	const rel = relative(ROOT, f).replace(/\\/g, '/');
	for (const m of src.matchAll(new RegExp(`\\bUI\\.(${mirrorAlt})\\b`, 'g'))) {
		const lineStart = src.lastIndexOf('\n', m.index) + 1;
		const lineEnd = src.indexOf('\n', m.index);
		const line = src.slice(lineStart, lineEnd === -1 ? src.length : lineEnd);
		if (/^\s*UI\.[\w$]+\s*=\s*UIEngine\./.test(line)) {
			textHits.push({ rel, kind: '镜像定义行', name: m[1] });
			continue;
		}
		if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
		textHits.push({ rel, kind: '调用点/读取', name: m[1], line: line.trim() });
	}
}
const defs = textHits.filter((h) => h.kind === '镜像定义行');
const users = textHits.filter((h) => h.kind !== '镜像定义行');
console.log(`  镜像定义行：${defs.length} 处（应 = 21，且全在 ui-window.ts）`);
console.log(`  其余文本引用：${users.length} 处`);
for (const u of users) console.log(`      ${u.rel}  ${u.name}   ${u.line ?? ''}`);

// (b) 动态查找：枚举/展开 UI 对象，或按字符串键取引擎方法
const DYN = [
	/\bObject\.(keys|values|entries)\s*\(\s*UI\b/,
	/\{\s*\.\.\.\s*UI\s*\}/,
	/\bfor\s*\(\s*(const|let|var)\s+\w+\s+in\s+UI\b/,
	/\bObject\.assign\s*\([^)]*\bUI\b/
];
const dynHits = [];
for (const f of files) {
	const src = readFileSync(f, 'utf8');
	const rel = relative(ROOT, f).replace(/\\/g, '/');
	for (const re of DYN) {
		for (const m of src.matchAll(new RegExp(re.source, 'g'))) {
			const line = src.slice(src.lastIndexOf('\n', m.index) + 1, src.indexOf('\n', m.index));
			dynHits.push({ rel, line: line.trim() });
		}
	}
}
console.log(`  枚举/展开 UI 对象的地方：${dynHits.length} 处`);
for (const h of dynHits) console.log(`      ${h.rel}  ${h.line}`);

// (c) 按字符串键取「引擎转发」的固定清单（store 那 7 个）
console.log('\n  按**字符串键**取引擎方法的清单（这些不靠文本 UI.x，文本扫描看不见）：');
for (const f of files) {
	const rel = relative(ROOT, f).replace(/\\/g, '/');
	const src = readFileSync(f, 'utf8');
	if (!/uiEngineForwardKeys|makeEngineForwarder|fromEngine\[key\]/.test(src)) continue;
	console.log(`      ${rel}`);
	for (const m of src.matchAll(/^\s*'([A-Za-z_$][\w$]*)',?\s*$/gm)) {
		if (MIRRORS.includes(m[1])) console.log(`          字符串键 '${m[1]}'（是镜像名）`);
	}
}
