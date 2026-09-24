// 一次性探针（第 125 轮）：给每一处 mojibake 找出**写坏之前**的原文。
//
// 判据是决定性的、不靠眼看：若某行 X 满足 `corrupt(X) == 现文`（corrupt = UTF-8 字节按 GBK
// 解码），那 X 就是原文 —— 在写坏那次提交的父提交里把这样的行搜出来即可。
// 难在路径：写坏的那些提交大多同时把 `legacy/inspector/*` 搬到了 `inspector/*`，
// 所以要先按 rename 解析出父提交里的旧路径。
//
// 运行：node scripts/oneoff/lookup-mojibake-origins.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ROOT } from '../lib/scan.mjs';
import { collectTextFiles } from '../lib/text-integrity.mjs';
import { detectMojibake } from '../lib/gbk-mojibake.mjs';

const gbkDecode = new TextDecoder('gbk');
const corrupt = (s) => gbkDecode.decode(Buffer.from(s, 'utf8'));
const git = (args) => {
	try {
		return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 });
	} catch {
		return null;
	}
};

/** 写坏这一次提交时，这个文件在父提交里的路径（处理 rename）。 */
function parentPath(commit, rel) {
	const nameStatus = git(['show', '--name-status', '-M', '--format=', commit]);
	if (nameStatus === null) return rel;
	for (const row of nameStatus.split('\n')) {
		const cols = row.split('\t');
		if (cols.length >= 2 && cols[cols.length - 1] === rel) {
			return cols.length === 3 ? cols[1] : rel; // Rxxx old new ⇒ 取 old
		}
	}
	return rel;
}

/** 在父提交的内容里搜「corrupt(X) 等于现文」的行。 */
function findOrigins(commit, rel, current) {
	const out = [];
	const path = parentPath(commit, rel);
	const content = git(['show', `${commit}^:${path}`]);
	if (content === null) return { path, origins: out, note: '父提交里没有这个文件（新建）' };
	const target = current.replace(/^\s+/, '');
	for (const [i, line] of content.split('\n').entries()) {
		if (line.replace(/^\s+/, '') === target) {
			out.push({ n: i + 1, text: line, kind: '逐字相同（这次提交没动它）' });
			continue;
		}
		const c1 = corrupt(line);
		if (c1.replace(/^\s+/, '') === target) {
			out.push({ n: i + 1, text: line, kind: '一趟误解码' });
			continue;
		}
		if (corrupt(c1).replace(/^\s+/, '') === target) {
			out.push({ n: i + 1, text: line, kind: '两趟误解码' });
		}
	}
	return { path, origins: out, note: null };
}

const files = collectTextFiles(ROOT);
const sites = [];
for (const { rel, full } of files) {
	for (const [i, line] of readFileSync(full, 'utf8').split('\n').entries()) {
		if (detectMojibake(line, { minChars: 2 }) !== null)
			sites.push({ rel, line: i + 1, text: line });
	}
}

for (const site of sites) {
	const blame = git(['blame', '-L', `${site.line},${site.line}`, '--porcelain', '--', site.rel]);
	const commit = blame === null ? null : blame.split('\n')[0].slice(0, 40);
	console.log(`\n──────────────────────────────────────────────────────────────`);
	console.log(`  ${site.rel}:${site.line}   写坏于 ${commit?.slice(0, 8)}`);
	console.log(`  现文  ${JSON.stringify(site.text)}`);
	if (commit === null) continue;
	const { path, origins, note } = findOrigins(commit, site.rel, site.text);
	console.log(`  父提交里的路径  ${path}${note === null ? '' : `  （${note}）`}`);
	if (origins.length === 0) console.log('  ✗ 没找到「corrupt(X) == 现文」的行');
	for (const o of origins)
		console.log(`  ✓ 第 ${o.n} 行（${o.kind}）：${JSON.stringify(o.text)}`);
}
