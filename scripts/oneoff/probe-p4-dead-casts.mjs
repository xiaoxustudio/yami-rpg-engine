// 一次性实验：P4（`as unknown as` 双重断言）里哪些**已经是多余的**。
// 只读（默认）或改写（--apply，配合 git checkout 还原）。用法：
//   node scripts/oneoff/probe-p4-dead-casts.mjs          # 只报告分布
//   node scripts/oneoff/probe-p4-dead-casts.mjs --apply  # 批量把 `as unknown as` 降成单次 `as`
//
// ## 为什么能一次判完 67 处
//
// 判据是「把 `expr as unknown as T` 降成 `expr as T` 后 tsc 是否还过」。每一处的**类型**判定
// 是局部且独立的（错误会落在该处所在行），所以**一次性全部降级、跑一次 tsc**，
// 就能拿到逐处的判决：报错的行 = 那个 `unknown` 跳板是承重的；没报错 = 它是多余的。
//
// ⚠️ 只是实验：`--apply` 之后的树是**故意写坏的**，判完必须 `git checkout -- <files>` 还原。
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const APPLY = process.argv.includes('--apply');
const { codeOnly, collectFiles, readSource, SCAN_DIRS, UNKNOWN_CAST_RE } = await import(
	pathToFileURL(join(ROOT, 'scripts/lib/scan.mjs')).href
);

const files = collectFiles({ dirs: SCAN_DIRS });
const sites = [];
let rawTotal = 0;

for (const { full, rel } of files) {
	const src = readSource(full);
	const masked = codeOnly(src);
	rawTotal += [...src.matchAll(/\bas\s+unknown\s+as\b/g)].length;
	const hits = [...masked.matchAll(UNKNOWN_CAST_RE)];
	if (!hits.length) continue;
	// 逐处记录行号（用于把 tsc 报错映射回具体那一处）
	const lineOf = (idx) => src.slice(0, idx).split('\n').length;
	for (const h of hits) {
		sites.push({
			rel: rel.replace(/\\/g, '/'),
			full,
			index: h.index,
			len: h[0].length,
			line: lineOf(h.index),
			snippet: src.slice(h.index, src.indexOf('\n', h.index)).trim().slice(0, 96)
		});
	}
}

console.log(`扫描文件 ${files.length} 个`);
console.log(`原始文本里的 \`as unknown as\`：${rawTotal} 处（含注释/字符串）`);
console.log(`**真实代码里**（codeOnly 口径，= 台账 unknown-casts）：${sites.length} 处`);
console.log(`⇒ 两者差 ${rawTotal - sites.length} 处，全在注释或字符串里（台账不数它们）\n`);

const byFile = new Map();
for (const s of sites) byFile.set(s.rel, (byFile.get(s.rel) ?? 0) + 1);
for (const [rel, n] of [...byFile].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))) {
	console.log(`  ${String(n).padStart(2)}  ${rel}`);
}

if (!APPLY) {
	console.log('\n（未改写。加 --apply 做批量降级实验。）');
} else {
	// 按文件分组、从后往前替换，避免偏移漂移
	const bySrc = new Map();
	for (const s of sites) {
		if (!bySrc.has(s.full)) bySrc.set(s.full, []);
		bySrc.get(s.full).push(s);
	}
	let changed = 0;
	for (const [full, list] of bySrc) {
		let src = readFileSync(full, 'utf8');
		for (const s of [...list].sort((a, b) => b.index - a.index)) {
			src = src.slice(0, s.index) + 'as' + src.slice(s.index + s.len);
			changed++;
		}
		writeFileSync(full, src, 'utf8');
	}
	// 把「哪一处原本在哪一行」落盘，供 tsc 报错映射（还原后行号不变，仍可复用）
	const out = join(process.env.TEMP ?? ROOT, 'p4-sites.json');
	writeFileSync(
		out,
		JSON.stringify(
			sites.map(({ rel, line, snippet }) => ({ rel, line, snippet })),
			null,
			1
		),
		'utf8'
	);
	console.log(
		`\n已把 ${changed} 处 \`as unknown as\` 降成 \`as\`（实验用，判完请 git checkout 还原）`
	);
	console.log(`站点清单已写入 ${out}`);
}
