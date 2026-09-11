#!/usr/bin/env node
// C2 执行器：删除「陈旧豁免注释」——仍带 `/* oxlint-disable eslint/no-restricted-properties */`
// 但 oxlint 判定该指令**已无命中**的文件（判定来源与 tracker 口径一致）。
//
// 用法：
//   node scripts/stale-exemptions.mjs            # 干跑（默认）：列出待删文件，不改任何文件
//   node scripts/stale-exemptions.mjs --check    # 门禁模式：仍有陈旧豁免则退出码 1
//   node scripts/stale-exemptions.mjs --simulate # 干跑 + 预演"将删几行"（与 --apply 同一套 strip 逻辑，不写盘）
//   node scripts/stale-exemptions.mjs --apply    # 真正删除（需人工点头；删完自动复跑 lint 校验）
//
// 安全约束：
//   1. 只删「独占一行」的块注释 `/* oxlint-disable ... no-restricted-properties */`；
//      行内的 `// oxlint-disable-next-line <其它规则>` 一律不碰。
//   2. 文件首行的 BOM 会被保留（若注释行带 BOM，则把 BOM 让给新的首行）。
//   3. --apply 之后立即跑 `oxlint`：出现任何 error 即视为失败并提示用 `git checkout --` 回滚。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');
const CHECK = process.argv.includes('--check');
const SIMULATE = process.argv.includes('--simulate');
const OXLINT = join(ROOT, 'node_modules', 'oxlint', 'bin', 'oxlint');

/** 跑 oxlint，取「指令未被使用」且指令名是 no-restricted-properties 的文件行 */
function collectStale() {
	const res = spawnSync(
		process.execPath,
		[OXLINT, '-c', '.oxlintrc.json', '--report-unused-disable-directives', '--format=json', 'packages/editor', 'packages/ui-kit'],
		{ cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
	);
	const text = res.stdout ?? '';
	const json = text.match(/\{[\s\S]*\}/);
	if (json === null) {
		console.error('stale-exemptions: 无法解析 oxlint 输出（oxlint 是否可用？）');
		process.exit(2);
	}
	const diagnostics = JSON.parse(json[0]).diagnostics ?? [];
	const stale = new Map(); // rel -> 行号集合
	for (const d of diagnostics) {
		const rel = String(d.filename ?? '');
		if (rel === '') continue;
		const line = d.labels?.[0]?.span?.line ?? 1;
		let source = '';
		try {
			source = readFileSync(join(ROOT, rel), 'utf8');
		} catch {
			continue;
		}
		if (!source.includes('no-restricted-properties')) continue;
		const text2 = source.split('\n')[line - 1] ?? '';
		if (!text2.includes('no-restricted-properties')) continue;
		if (!stale.has(rel)) stale.set(rel, new Set());
		stale.get(rel).add(line);
	}
	return stale;
}

const DIRECTIVE_RE = /^\s*(?:\ufeff)?\/\* oxlint-disable\s+eslint\/no-restricted-properties\s*\*\/\s*$/;

function strip(rel, lines) {
	const kept = [];
	let bom = /\ufeff/.test(lines[0] ?? '') || readFileSync(join(ROOT, rel), 'utf8').charCodeAt(0) === 0xfeff;
	const removed = [];
	for (const line of lines) {
		if (DIRECTIVE_RE.test(line)) {
			if (line.includes('\ufeff')) bom = true;
			removed.push(line.trim());
			continue;
		}
		kept.push(line.replace(/\ufeff/g, ''));
	}
	const body = kept.join('\n');
	return { content: (bom ? '\ufeff' : '') + body, removed };
}

function main() {
	const stale = collectStale();
	const files = [...stale.keys()].sort((a, b) => a.localeCompare(b));

	if (CHECK) {
		if (files.length === 0) {
			console.log('stale-exemptions: OK（无陈旧豁免注释）');
			process.exit(0);
		}
		console.error(`stale-exemptions: ${files.length} 个文件仍带「已无命中」的 no-restricted-properties 豁免注释（C2 未完成）。`);
		process.exit(1);
	}

	if (!APPLY) {
		console.log(`stale-exemptions: 干跑 —— 待删注释 ${files.length} 个文件。`);
		for (const rel of files.slice(0, 20)) console.log(`  - ${rel}`);
		if (files.length > 20) console.log(`  …（其余 ${files.length - 20} 个见 --check 或逐文件核对）`);
		if (SIMULATE) {
			// 用与 --apply 完全相同的 strip() 预演，但不写盘：证明"删哪几行"可预期
			let removedTotal = 0;
			let skipped = 0;
			for (const rel of files) {
				const source = readFileSync(join(ROOT, rel), 'utf8');
				const { removed } = strip(rel, source.split('\n'));
				if (removed.length === 0) {
					console.log(`  SKIP ${rel}（豁免指令不在独占行）`);
					skipped++;
					continue;
				}
				removedTotal += removed.length;
			}
			console.log(`stale-exemptions: 预演（--simulate）——将删除 ${removedTotal} 行、覆盖 ${files.length - skipped} 个文件，跳过 ${skipped} 个。`);
		}
		console.log('提示：确认无误后用 `node scripts/stale-exemptions.mjs --apply` 执行；执行后跑 `pnpm lint` 与 `pnpm dom:guard:tracker`。');
		return;
	}

	if (!existsSync(OXLINT)) {
		console.error('stale-exemptions: 找不到 oxlint，终止。');
		process.exit(2);
	}
	let changed = 0;
	let skipped = 0;
	for (const rel of files) {
		const file = join(ROOT, rel);
		const source = readFileSync(file, 'utf8');
		const { content, removed } = strip(rel, source.split('\n'));
		if (removed.length === 0) {
			// 指令不在独占行（例如行内形式）——不冒险，交人工处理
			console.error(`stale-exemptions: SKIP ${rel}（豁免指令不在独占行）`);
			skipped++;
			continue;
		}
		writeFileSync(file, content);
		changed++;
	}
	console.log(`stale-exemptions: 已删除 ${changed} 个文件的陈旧豁免注释（跳过 ${skipped}）。`);

	const lint = spawnSync(process.execPath, [OXLINT, '-c', '.oxlintrc.json', 'packages/editor', 'packages/ui-kit'], {
		cwd: ROOT,
		encoding: 'utf8'
	});
	const tail = (lint.stdout ?? '').trim().split('\n').slice(-2).join(' ');
	console.log(`stale-exemptions: 复跑 oxlint → ${tail}`);
	if (lint.status !== 0) {
		console.error('stale-exemptions: lint 未通过——请用 `git checkout -- packages` 回滚后排查。');
		process.exit(1);
	}
	const after = collectStale();
	console.log(`stale-exemptions: 复检陈旧豁免 → ${after.size} 个文件。`);
}

main();
