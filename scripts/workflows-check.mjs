#!/usr/bin/env node
/**
 * GitHub Actions workflow 的可执行性守卫。
 *
 * 为什么需要：`.github/workflows/` 里的命令**不会被任何本地门禁执行** —— 写错一个包脚本名、
 * 引用一个已删除的 `scripts/*.mjs`，要等到 PR 真正跑 CI 才会红（甚至只在某条分支上跑）。
 * 本仓 2026-10 新增了 `e2e.yml` / `coverage.yml` 两个 workflow，它们引用的脚本名与路径
 * 都没有任何静态校验，这条守卫把它们纳入门禁。
 *
 * 校验什么（全部是「可静态判定」的，不做 YAML 语义推断）：
 *   A) `pnpm run <script>` / `pnpm <script>` 指向的脚本必须存在于根 package.json；
 *      带 `-F <pkg>` 的递归形式跳过（包内脚本由 pnpm 自己解析）。
 *   B) `node scripts/<file>` 引用的文件必须存在。
 *   C) 每个 workflow 必须有 `on:` 触发段（防止写成永远不触发的死文件）。
 *
 * 用法：
 *   node scripts/workflows-check.mjs            校验（失败退出 1）
 *   node scripts/workflows-check.mjs --json     机器可读
 *   node scripts/workflows-check.mjs --selftest 门禁自证：坏样例必须被抓出来
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKFLOWS = join(ROOT, '.github/workflows');
const AS_JSON = process.argv.includes('--json');

/** 从一段 shell 里抽出被引用的包脚本名（跳过 `-F <pkg>` 递归形式）。 */
export function referencedScripts(text) {
	const names = new Set();
	for (const match of text.matchAll(
		/(?:^|[\s;&|(`])pnpm\s+(?:run\s+|run\s+-s\s+)?([a-zA-Z][\w:-]*)/g
	)) {
		const name = match[1];
		// `pnpm -F` / `pnpm --filter` 是包内执行，脚本不在根 package.json 里
		if (name === 'exec' || name === 'dlx' || name === 'install') continue;
		names.add(name);
	}
	return [...names];
}

/** 从一段 shell 里抽出 `node scripts/...` 引用的相对路径。 */
export function referencedNodeScripts(text) {
	const paths = new Set();
	for (const match of text.matchAll(/(?:^|[\s;&|(`])node\s+(scripts\/[\w./-]+\.(?:mjs|js))/g)) {
		paths.add(match[1]);
	}
	return [...paths];
}

/** 取出一份 workflow 里所有 `run:` 的命令文本（含 `run: |` 块）。 */
function runBlocks(text) {
	const blocks = [];
	const lines = text.split(/\r?\n/);
	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const inline = /^\s*-?\s*run:\s*(.+)$/.exec(line);
		if (!inline) continue;
		if (inline[1].trim() === '|' || inline[1].trim() === '>') {
			const indent = line.search(/\S/);
			const collected = [];
			for (let cursor = index + 1; cursor < lines.length; cursor++) {
				const next = lines[cursor];
				if (next.trim() === '') {
					collected.push('');
					continue;
				}
				const nextIndent = next.search(/\S/);
				if (nextIndent <= indent) break;
				collected.push(next);
			}
			blocks.push(collected.join('\n'));
			continue;
		}
		blocks.push(inline[1]);
	}
	return blocks;
}

export function checkWorkflow(fileName, text, rootScripts, exists) {
	const problems = [];
	if (!/^\s*on:/m.test(text)) {
		problems.push({ file: fileName, kind: 'trigger', detail: '缺少 on: 触发段' });
	}
	for (const block of runBlocks(text)) {
		for (const script of referencedScripts(block)) {
			if (!rootScripts.has(script)) {
				problems.push({
					file: fileName,
					kind: 'script',
					detail: `pnpm run ${script} —— 根 package.json 里没有这个脚本`
				});
			}
		}
		for (const scriptPath of referencedNodeScripts(block)) {
			if (!exists(scriptPath)) {
				problems.push({
					file: fileName,
					kind: 'path',
					detail: `node ${scriptPath} —— 文件不存在`
				});
			}
		}
	}
	return problems;
}

function main() {
	const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
	const rootScripts = new Set(Object.keys(pkg.scripts ?? {}));
	const files = existsSync(WORKFLOWS)
		? readdirSync(WORKFLOWS).filter((name) => name.endsWith('.yml') || name.endsWith('.yaml'))
		: [];

	const problems = [];
	const checked = [];
	for (const file of files) {
		const text = readFileSync(join(WORKFLOWS, file), 'utf8');
		checked.push(file);
		problems.push(
			...checkWorkflow(file, text, rootScripts, (relative) =>
				existsSync(join(ROOT, relative))
			)
		);
	}

	if (AS_JSON) {
		console.log(JSON.stringify({ ok: problems.length === 0, checked, problems }, null, 2));
		if (problems.length > 0) process.exit(1);
		return;
	}

	if (problems.length > 0) {
		console.error(`✗ workflow 校验失败（${problems.length} 处）：`);
		for (const problem of problems) console.error(`  ${problem.file}: ${problem.detail}`);
		process.exit(1);
	}
	console.log(`✓ workflow 校验通过：${checked.join(', ')}（包脚本与 scripts/ 引用都存在）`);
}

/** 自证：坏样例（不存在的脚本 / 不存在的文件 / 缺 on:）必须被抓出来。 */
function selftest() {
	const rootScripts = new Set(['lint', 'e2e']);
	const exists = (path) => path === 'scripts/ok.mjs';

	const good = [
		'on:',
		'    workflow_dispatch:',
		'jobs:',
		'    a:',
		'        steps:',
		'            - run: pnpm run lint',
		'            - run: node scripts/ok.mjs',
		'            - run: pnpm -F @yami/editor test'
	].join('\n');
	if (checkWorkflow('good.yml', good, rootScripts, exists).length !== 0) {
		console.error('✗ 自证失败：合法 workflow 被判红');
		process.exit(1);
	}

	const badScript = checkWorkflow(
		'bad.yml',
		'on:\n    workflow_dispatch:\njobs:\n    a:\n        steps:\n            - run: pnpm run nope',
		rootScripts,
		exists
	);
	if (!badScript.some((problem) => problem.kind === 'script')) {
		console.error('✗ 自证失败：不存在的包脚本没被抓到');
		process.exit(1);
	}

	const badPath = checkWorkflow(
		'bad.yml',
		'on:\n    workflow_dispatch:\njobs:\n    a:\n        steps:\n            - run: |\n                  node scripts/gone.mjs\n                  pnpm e2e',
		rootScripts,
		exists
	);
	if (!badPath.some((problem) => problem.kind === 'path')) {
		console.error('✗ 自证失败：不存在的脚本路径没被抓到');
		process.exit(1);
	}

	const noTrigger = checkWorkflow(
		'bad.yml',
		'jobs:\n    a:\n        steps:\n            - run: pnpm e2e',
		rootScripts,
		exists
	);
	if (!noTrigger.some((problem) => problem.kind === 'trigger')) {
		console.error('✗ 自证失败：缺 on: 的文件没被抓到');
		process.exit(1);
	}

	console.log('✓ workflow 校验自证通过：合法判绿 / 缺脚本、缺文件、缺触发段判红');
}

if (process.argv.includes('--selftest')) selftest();
else main();
