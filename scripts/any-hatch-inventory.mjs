/**
 * `any-hatches` 站点清单 —— 把「每个站点属于哪个接口」这一步机械化。
 *
 * 为什么需要它（第 54 轮踩过的坑）：用 `grep '^interface '` 自己建「接口 → 行号」映射会漏掉
 * `export interface`，映射整体错位，删掉的签名其实是**另一个接口**的（语法合法、语义全错）。
 * 本脚本按**站点行往上找最近的 interface 声明**来归属，并显式标出是不是 `export` 的。
 *
 * 用法：
 *   node scripts/any-hatch-inventory.mjs            # 全部站点
 *   node scripts/any-hatch-inventory.mjs --axis     # 只看汇总（按文件/接口聚合的处数）
 * 口径与台账一致：scripts/lib/scan.mjs 的 collectFiles / readSource / codeOnly / ANY_HATCH_RE。
 */
import { ROOT, SCAN_DIRS, collectFiles, readSource, codeOnly, ANY_HATCH_RE } from './lib/scan.mjs';

const files = collectFiles({ dirs: SCAN_DIRS });
const rows = [];
for (const { full, rel } of files) {
	const text = readSource(full);
	const code = codeOnly(text);
	ANY_HATCH_RE.lastIndex = 0;
	const lines = text.split('\n');
	for (const m of code.matchAll(ANY_HATCH_RE)) {
		const lineNo = text.slice(0, m.index).split('\n').length; // 1-based
		let owner = '(顶层)';
		let ownerLine = 0;
		let exported = false;
		for (let i = lineNo - 1; i >= 0; i--) {
			const decl = lines[i].match(/^\s*(export\s+)?(?:interface|type)\s+([A-Za-z_$][\w$]*)/);
			if (decl) {
				owner = decl[2];
				ownerLine = i + 1;
				exported = Boolean(decl[1]);
				break;
			}
		}
		rows.push({ rel, line: lineNo, owner, ownerLine, exported, text: lines[lineNo - 1].trim() });
	}
}

if (process.argv.includes('--axis')) {
	const byFile = new Map();
	for (const r of rows) byFile.set(r.rel, (byFile.get(r.rel) ?? 0) + 1);
	console.log(`any-hatches 站点：${rows.length} 处 / ${byFile.size} 文件\n`);
	for (const [rel, n] of [...byFile].sort((a, b) => b[1] - a[1])) console.log(`${String(n).padStart(3)}  ${rel}`);
} else {
	console.log(`any-hatches 站点：${rows.length} 处（口径：scripts/lib/scan.mjs）\n`);
	for (const r of rows) {
		console.log(`${r.rel}:${r.line}`);
		console.log(`    接口 ${r.owner}${r.exported ? ' (export)' : ''}  @L${r.ownerLine}`);
	}
}
console.log(
	'\n提示：`export interface` 也要能被找到 —— 本脚本已覆盖；\n' +
		'     探测某个站点是否可删时，先按**接口名**定位（别按行号映射），再删该接口内的签名行。'
);
