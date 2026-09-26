// 一次性盘点：`as unknown as` 剩余的站点，按「来源/目标类型是不是同一文件里的局部类型」分类。
// 只读。用法：node scripts/oneoff/measure-p4-shapes.mjs
//
// 为什么这么盘（第 118 轮的判别信号）：**两处各写一半的局部类型**是索引签名的另一种形态 ——
// 断言的来源类型与目标类型是同一个运行期对象的两个子集时，正确做法是**合并**，不是缩短断言。
// 所以最值得先看的站点，是「目标类型名是本文件里声明的 interface/type」那些。
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const { codeOnly, collectFiles, readSource, SCAN_DIRS, UNKNOWN_CAST_RE } = await import(
	pathToFileURL(join(ROOT, 'scripts/lib/scan.mjs')).href
);

const files = collectFiles({ dirs: SCAN_DIRS });
const rows = [];

for (const { full, rel } of files) {
	const src = readSource(full);
	const masked = codeOnly(src);
	// 本文件里声明的局部 interface / type 名字
	const localTypes = new Set(
		[...masked.matchAll(/^\s*(?:export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)/gm)].map(
			(m) => m[1]
		)
	);
	for (const m of masked.matchAll(UNKNOWN_CAST_RE)) {
		const lineNo = src.slice(0, m.index).split('\n').length;
		const lineEnd = src.indexOf('\n', m.index);
		const line = src.slice(
			src.lastIndexOf('\n', m.index) + 1,
			lineEnd === -1 ? src.length : lineEnd
		);
		// 目标类型名：`as unknown as` 之后紧跟的第一个标识符
		const after = src.slice(m.index + m[0].length);
		const target = after.match(/^\s*([A-Za-z_$][\w$]*)/)?.[1] ?? '（字面量/泛型）';
		rows.push({
			rel: rel.replace(/\\/g, '/'),
			lineNo,
			target,
			localTarget: localTypes.has(target),
			snippet: line.trim().slice(0, 120)
		});
	}
}

rows.sort((a, b) => Number(b.localTarget) - Number(a.localTarget) || a.rel.localeCompare(b.rel));

console.log(`站点 ${rows.length} 处\n`);
console.log('=== A. 目标类型是**本文件里声明的局部类型**（最像「两处各写一半」的一类）===');
const a = rows.filter((r) => r.localTarget);
for (const r of a) console.log(`  ${r.rel}:${r.lineNo}  → ${r.target}\n      ${r.snippet}`);
console.log(`  （共 ${a.length} 处）`);

console.log('\n=== B. 目标类型是别处的具名类型 ===');
const b = rows.filter((r) => !r.localTarget && r.target !== '（字面量/泛型）');
for (const r of b) console.log(`  ${r.rel}:${r.lineNo}  → ${r.target}`);
console.log(`  （共 ${b.length} 处）`);

console.log('\n=== C. 目标是匿名/字面量/泛型（交叉类型、Record、never 等）===');
const c = rows.filter((r) => r.target === '（字面量/泛型）');
for (const r of c) console.log(`  ${r.rel}:${r.lineNo}\n      ${r.snippet}`);
console.log(`  （共 ${c.length} 处）`);
