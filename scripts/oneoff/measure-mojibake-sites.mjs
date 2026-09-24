// 一次性探针（第 125 轮）：把全仓的 mojibake 站点逐条摊开 —— 现文、还原结果、
// **git 血缘**（哪一次提交写坏的、上一次是什么）。修复要靠这些证据，不能靠猜。
//
// 运行：node scripts/oneoff/measure-mojibake-sites.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from '../lib/scan.mjs';
import { collectTextFiles } from '../lib/text-integrity.mjs';
import { detectMojibake, recoverUntilStable } from '../lib/gbk-mojibake.mjs';

const git = (args) => {
	try {
		return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
	} catch {
		return null;
	}
};

const files = collectTextFiles(ROOT);
const sites = [];
for (const { rel, full } of files) {
	const lines = readFileSync(full, 'utf8').split('\n');
	for (const [i, line] of lines.entries()) {
		if (detectMojibake(line, { minChars: 2 }) !== null)
			sites.push({ rel, line: i + 1, text: line });
	}
}

console.log(`\n=== 全仓 mojibake 站点 ${sites.length} 处 ===`);
for (const site of sites) {
	const rec = recoverUntilStable(site.text, { minChars: 2 });
	const blame = git(['blame', '-L', `${site.line},${site.line}`, '--porcelain', '--', site.rel]);
	const hash = blame === null ? null : blame.split('\n')[0].slice(0, 8);
	const subject = hash === null ? null : git(['log', '-1', '--format=%s', hash])?.trim();
	const before = hash === null ? null : git(['show', `${hash}^:${site.rel}`]);
	const beforeLine = before === null ? null : (before.split('\n')[site.line - 1] ?? null);

	console.log(`\n──────────────────────────────────────────────────────────────`);
	console.log(`  ${site.rel}:${site.line}`);
	console.log(`  现文    ${JSON.stringify(site.text)}`);
	console.log(`  还原    ${JSON.stringify(rec.text)}`);
	console.log(`  迭代    ${rec.chain.length} 趟`);
	console.log(`  写坏于  ${hash}  ${subject}`);
	console.log(`  上一版  ${JSON.stringify(beforeLine)}`);
	if (beforeLine !== null && beforeLine !== site.text) {
		const prev = recoverUntilStable(beforeLine, { minChars: 2 });
		console.log(`  上一版还乱? ${prev.chain.length > 0}  ${JSON.stringify(prev.text)}`);
	}
}

console.log(`\n=== 阈值复核（「像文本」过滤器已生效）===`);
for (const minChars of [1, 2, 3]) {
	let n = 0;
	for (const { full } of files) {
		for (const line of readFileSync(full, 'utf8').split('\n')) {
			if (detectMojibake(line, { minChars }) !== null) n++;
		}
	}
	console.log(`  minChars=${minChars} ⇒ ${n} 行`);
}

console.log(`\n=== 这些文件在扫描面里的分布 ===`);
const byDir = new Map();
for (const s of sites) {
	const dir = join(s.rel, '..').replace(/\\/g, '/');
	byDir.set(dir, (byDir.get(dir) ?? 0) + 1);
}
for (const [dir, n] of [...byDir.entries()].sort((a, b) => a[0].localeCompare(b[0])))
	console.log(`  ${n}  ${dir}`);
