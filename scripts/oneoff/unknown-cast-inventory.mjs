// 盘点 `unknown-casts` 轴的**逐处**位置。
//
// 台账（migration-ledger）只给到前 20 个文件的计数，动工前需要「哪一行、那一行长什么样」。
// 口径与 `scripts/migration-ledger.mjs` 的 `unknown-casts` 轴完全一致（同一个 lib/scan.mjs：
// 同 SCAN_DIRS、同 EXCLUDE_RE、同 UNKNOWN_CAST_RE、同 codeOnly），所以这里的 total
// 必须与 `pnpm migration:check` 的读数逐字相等 —— 不相等就是口径漂了，别拿它做决策。
//
// 用法：node scripts/oneoff/unknown-cast-inventory.mjs [--context]
import { SCAN_DIRS, collectFiles, readSource, codeOnly, UNKNOWN_CAST_RE } from '../lib/scan.mjs';

const withContext = process.argv.includes('--context');

/** 逐处扫描：返回 { rel, line, text }[]（行号按 codeOnly 后的等长文本取，与源文件对齐） */
function sites(files) {
	const out = [];
	for (const { full, rel } of files) {
		const code = codeOnly(readSource(full));
		const lines = code.split('\n');
		lines.forEach((line, index) => {
			// 每行独立重置 lastIndex（正则带 /g）
			UNKNOWN_CAST_RE.lastIndex = 0;
			if (!UNKNOWN_CAST_RE.test(line)) return;
			out.push({
				rel,
				line: index + 1,
				text: readSource(full).split('\n')[index].trim()
			});
		});
	}
	return out;
}

const files = collectFiles();
const found = sites(files);
const byFile = new Map();
for (const site of found) {
	byFile.set(site.rel, (byFile.get(site.rel) ?? 0) + 1);
}

console.log(`unknown-casts 逐处清单：${found.length} 处 / ${byFile.size} 文件`);
console.log(`（口径：${SCAN_DIRS.join(' + ')}，排除 spec/d.ts/__tests__/demo）\n`);

for (const [rel, count] of [...byFile.entries()].sort(
	(a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
)) {
	console.log(`${String(count).padStart(2)}  ${rel}`);
	for (const site of found.filter((s) => s.rel === rel)) {
		console.log(
			`      :${site.line}  ${site.text.length > 120 ? `${site.text.slice(0, 120)}…` : site.text}`
		);
		if (withContext) {
			const src = readSource(files.find((f) => f.rel === rel).full).split('\n');
			for (let d = -2; d <= 2; d += 1) {
				if (d === 0) continue;
				const l = src[site.line - 1 + d];
				if (l !== undefined) console.log(`          ${d > 0 ? '+' : ''}${d}  ${l.trim()}`);
			}
		}
	}
	console.log('');
}

console.log('提示：与 `pnpm migration:check` 的 unknown-casts 读数比对，必须相等。');
