// 一次性测量：阶段 1c 第 ④-3 步（逐域把 `UI.x = …` 改为 facade 装配）**动手前**要回答的问题。
// 只读。用法：node scripts/oneoff/measure-4-3.mjs
//
// 问题一：82 处挂载分布在哪些域、各多少处？（口径与台账 ui-singleton-members **同源**）
// 问题二：这 82 处里，有多少**被任何 spec 直接引用过**？（= 改动的可验证面有多大）
// 问题三：这些成员依赖 `this` 吗？模块内部还有多少 `UI.<name>` 交叉引用？（= 改写会不会踩到绑定语义）
// 问题四：谁从外面取这个 UI 对象？（= ④-4 退役字面量时的接线面）

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const scan = await import(pathToFileURL(join(ROOT, 'scripts/lib/scan.mjs')).href);
const { codeOnly, collectFiles, readSource, SCAN_DIRS } = scan;

// 与 UI_SINGLETON_RE 同语义，另带一个捕获组拿名字
const MOUNT_RE = /\bUI\.([A-Za-z_$][\w$]*)\s*=(?!=)/g;
const norm = (p) => p.replace(/\\/g, '/');

const src = collectFiles({ dirs: SCAN_DIRS });
const specs = collectFiles({ dirs: SCAN_DIRS, includeTests: true }).filter((f) =>
	f.rel.endsWith('.spec.ts')
);
const specText = specs.map(({ full }) => readSource(full)).join('\n');
const specRefs = (name) => new RegExp(`\\b(?:UI|this)\\.${name}\\b`).test(specText);

// ── 问题一 + 问题二：逐文件挂载清单 + 测试是否直接引用
console.log('=== 一 / 二：82 处挂载的分布与「被 spec 直接引用」情况 ===');
const perFile = [];
for (const { full, rel } of src) {
	const code = codeOnly(readSource(full));
	const names = [...code.matchAll(MOUNT_RE)].map((m) => m[1]);
	if (!names.length) continue;
	perFile.push({ rel: norm(rel), full, code, names });
}
perFile.sort((a, b) => b.names.length - a.names.length || a.rel.localeCompare(b.rel));

let totalMounts = 0;
let coveredMounts = 0;
for (const f of perFile) {
	const covered = f.names.filter(specRefs);
	totalMounts += f.names.length;
	coveredMounts += covered.length;
	const pct = ((covered.length / f.names.length) * 100).toFixed(0);
	console.log(
		`\n  ${f.rel}  ${f.names.length} 处（spec 直接引用 ${covered.length} 处 / ${pct}%）`
	);
	console.log(`      ${f.names.join(', ')}`);
}
console.log(
	`\n  合计 ${totalMounts} 处 / ${perFile.length} 文件；其中被 spec 直接引用的 **${coveredMounts} 处**` +
		`（${((coveredMounts / totalMounts) * 100).toFixed(0)}%）`
);
console.log(`  未被任何 spec 直接引用的：**${totalMounts - coveredMounts} 处**`);

// ── 问题三：绑定语义与模块内交叉引用
console.log('\n=== 三：`this` 依赖与模块内 `UI.<name>` 交叉引用（改写要保的东西） ===');
for (const f of perFile) {
	const thisReads = [...f.code.matchAll(/\bthis\.[A-Za-z_$][\w$]*/g)].length;
	const thisWrites = [...f.code.matchAll(/\bthis\.[A-Za-z_$][\w$]*\s*=(?!=)/g)].length;
	const uiRefs = [...f.code.matchAll(/\bUI\.[A-Za-z_$][\w$]*/g)].length;
	const chained = [...f.code.matchAll(/[\w$.]+\s*=\s*UI\.[A-Za-z_$][\w$]*\s*=/g)].length;
	console.log(
		`  ${f.rel.padEnd(52)} this 读 ${String(thisReads).padStart(3)} · this 写 ${String(thisWrites).padStart(2)}` +
			` · UI.* 引用 ${String(uiRefs).padStart(3)} · 链式赋值 ${chained}`
	);
}

// ── 问题四：外部取 UI 对象的地方（④-4 的接线面）
console.log('\n=== 四：从外部取 `UI` 对象的点（④-4 退役字面量时的接线面） ===');
const all = collectFiles({ dirs: SCAN_DIRS, includeTests: true });
for (const { full, rel } of all) {
	const text = readSource(full);
	const lines = text.split('\n');
	lines.forEach((line, i) => {
		if (!/legacy\/ui-window/.test(line)) return;
		if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
		if (rel.endsWith('.spec.ts')) return; // 测试另算
		console.log(`  ${norm(rel)}:${i + 1}  ${line.trim()}`);
	});
}
console.log('  （spec 里 mock/import 的另有 6 个文件，不在此列）');

console.log('\n=== 五：ui-window.ts 自身规模 ===');
const winRel = perFile.find((f) => f.rel.endsWith('ui-singleton.ts'));
if (winRel) {
	const lines = readFileSync(join(ROOT, winRel.rel), 'utf8').split('\n');
	console.log(`  ${winRel.rel}：${lines.length} 行；直接挂载 ${winRel.names.length} 处`);
}
const declared = (() => {
	// 直接借台账的口径（单一真源），别在这里重写一份解析
	const urls = pathToFileURL(join(ROOT, 'scripts/lib/ui-slots.mjs')).href;
	return import(urls).then((m) => m.declaredSlots().length);
})();
console.log(`  对象字面量自身的槽位数（台账 declared）：${await declared}`);
