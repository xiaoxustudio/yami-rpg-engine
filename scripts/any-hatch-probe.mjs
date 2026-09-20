/**
 * `any-hatches`「可白捡组」探测（第 62 轮）。
 *
 * 目的：把「哪些索引签名其实没人按运行时键读」这一步**机械化**。
 * 方法：逐文件删掉该文件里**独占一行**的索引签名（`\t[k: string]: any;`），跑 `tsc`：
 *   - 0 报错 ⇒ 这个文件的所有站点都是白捡的（没人按键读）
 *   - 有报错 ⇒ 站点承重，逐条打印报错让下一轮枚举成员
 *
 * 只处理**独占一行**的形态。内联形态（`X & { [k: string]: any }`、一行 type alias、
 * `{ a; b; [k: string]: any }`）与 `.vue` 里的 3 处需要逐个类型设计，不归本探针管。
 *
 * 用法：node scripts/any-hatch-probe.mjs
 * 副作用：会临时改写工作区文件，**结束时用 `git checkout --` 全部还原**。
 *         运行前工作树必须是干净的（HEAD 即基线），脚本会自检。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, collectFiles, readSource, codeOnly, ANY_HATCH_RE } from './lib/scan.mjs';

const STANDALONE_RE = /^\s*\[(?:k|key):\s*string\]:\s*any;\s*$/;

function git(args, opts = {}) {
	return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', ...opts });
}

// --- 前置：工作树必须干净，否则还原会吃掉别人的改动 -------------------------
// 只看**已跟踪**文件的改动：`git checkout -- .` 只还原已跟踪文件，
// 未跟踪的文件不会被它吃掉（本探针脚本自己就是未跟踪的）。
const dirty = git(['status', '--porcelain', '--untracked-files=no']).trim();
if (dirty !== '') {
	console.error('✖ 工作树不干净，拒绝运行（还原时会吃掉未提交的改动）：\n' + dirty);
	process.exit(2);
}

// --- 收集：每个文件的「独占一行」站点 ---------------------------------------
const files = collectFiles({ dirs: ['packages/editor/src'] });
const targets = [];
for (const { full, rel } of files) {
	const text = readSource(full);
	if (!ANY_HATCH_RE.test(text)) continue;
	ANY_HATCH_RE.lastIndex = 0;
	const lines = text.split('\n');
	const standalone = [];
	lines.forEach((l, i) => {
		if (STANDALONE_RE.test(l)) standalone.push(i);
	});
	// 只统计 codeOnly 口径下的真实命中，避免把注释里的示例当成站点
	const codeHits = (codeOnly(text).match(((ANY_HATCH_RE.lastIndex = 0), ANY_HATCH_RE)) ?? [])
		.length;
	if (standalone.length === 0) continue;
	targets.push({ full, rel, lines, standalone, codeHits });
}

console.log(`探针目标：${targets.length} 个文件（含「独占一行」站点的）\n`);

const results = [];
for (const t of targets) {
	// 从干净态出发
	git(['checkout', '--', '.']);
	// 删掉该文件所有独占一行的签名
	const kept = t.lines.filter((_, i) => !t.standalone.includes(i));
	writeFileSync(t.full, kept.join('\n'), 'utf8');
	const removed = t.lines.length - kept.length;

	let out = '';
	let errCount = 0;
	try {
		execFileSync(
			'node',
			[
				join(ROOT, 'packages', 'editor', 'node_modules', 'typescript', 'bin', 'tsc'),
				'--noEmit',
				'-p',
				'tsconfig.strict.json'
			],
			{ cwd: join(ROOT, 'packages', 'editor'), encoding: 'utf8', stdio: 'pipe' }
		);
	} catch (e) {
		out = String(e.stdout ?? '') + String(e.stderr ?? '');
		errCount = (out.match(/error TS\d+/g) ?? []).length;
	}
	git(['checkout', '--', '.']);

	const verdict = errCount === 0 ? '✅ 白捡（可全删）' : `❌ 承重 ${errCount} 处报错`;
	results.push({
		rel: t.rel,
		removed,
		errCount,
		samples: out
			.split('\n')
			.filter((l) => /error TS\d+/.test(l))
			.slice(0, 4)
	});
	console.log(
		`${verdict}  ${t.rel}  （独占一行站点 ${removed} 处 / 文件内 codeOnly 命中 ${t.codeHits}）`
	);
	for (const s of results.at(-1).samples) console.log('      ' + s.trim());
}

// --- 收尾：确保干净 ---------------------------------------------------------
git(['checkout', '--', '.']);

console.log('\n================ 汇总 ================');
const free = results.filter((r) => r.errCount === 0);
console.log(`可白捡文件：${free.length} 个`);
for (const f of free) console.log(`  - ${f.rel}（-${f.removed} 处）`);
console.log(`可白捡站点合计：${free.reduce((s, r) => s + r.removed, 0)} 处`);
console.log(`承重文件：${results.length - free.length} 个`);
console.log(
	'\n还原状态：' +
		(git(['status', '--porcelain', '--untracked-files=no']).trim() === ''
			? '干净 ✅（只统计已跟踪文件；本脚本自身是未跟踪的，不算改动）'
			: '⚠️ 仍有改动')
);
