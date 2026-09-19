#!/usr/bin/env node
// vue-tsc 类型检查守卫：与 baseline 对比，仅拦截新增错误，不要求清零存量。
// 用法：
//   node scripts/check-vue-types.mjs                   检查新增错误（有新增则 exit 1）
//   node scripts/check-vue-types.mjs --update-baseline 重新生成 baseline
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_FILE = join(ROOT, 'scripts', 'vue-types-baseline.json');
const TSC_BIN = join(ROOT, 'node_modules', 'vue-tsc', 'bin', 'vue-tsc.js');
const ERROR_RE = /^(.+?)\((\d+),(\d+)\): error (TS\d+):/;
const ANSI_RE = new RegExp(
	`[${String.fromCharCode(27)}${String.fromCharCode(155)}][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-PRZcf-nq-uy=><]`,
	'g'
);

function runVueTsc() {
	const res = spawnSync(process.execPath, [TSC_BIN, '--noEmit', '-p', 'tsconfig.strict.json'], {
		cwd: ROOT,
		encoding: 'utf8'
	});
	// 「工具起不来」必须与「工具说 0 错误」区分开。
	// 受限环境（沙箱 / 精简容器）里 spawnSync 会 EPERM；过去只报一条 failed to launch 然后
	// exit 1，但**那种 1 和「真发现了新增错误」的 1 长得一样**，很容易被当成同一个信号忽略。
	// 现在用退出码 3 单独标记「不可判定」。
	if (res.error || (res.status === null && !res.stdout)) {
		console.error(`typecheck:vue: 无法启动 vue-tsc（${res.error?.code ?? 'unknown'}）。`);
		console.error('  这是**环境问题**，不是「0 新增错误」。CI 里应把它当作失败处理。');
		process.exit(3);
	}
	return `${res.stdout ?? ''}${res.stderr ?? ''}`;
}

function parseSignatures(output) {
	const signatures = [];
	for (const line of output.replace(ANSI_RE, '').split(/\r?\n/)) {
		const m = ERROR_RE.exec(line);
		if (m) signatures.push(`${m[1]}:${m[2]}:${m[3]}: ${m[4]}`);
	}
	return signatures;
}

function loadBaseline() {
	return JSON.parse(readFileSync(BASELINE_FILE, 'utf8'));
}

function updateBaseline(signatures) {
	writeFileSync(
		BASELINE_FILE,
		JSON.stringify(
			[...signatures].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
			null,
			'\t'
		) + '\n'
	);
	console.log(`baseline: updated ${BASELINE_FILE} (${signatures.length} errors).`);
}

function check(signatures) {
	const current = new Set(signatures);
	const baseline = new Set(loadBaseline());
	const added = [...current].filter((s) => !baseline.has(s));
	const fixed = [...baseline].filter((s) => !current.has(s));
	console.log(
		`vue-tsc errors: ${current.size} (baseline ${baseline.size}, new ${added.length}, fixed ${fixed.length})`
	);
	if (fixed.length > 0) {
		console.log(`fixed (consider updating baseline):`);
		for (const s of fixed) console.log(`  - ${s}`);
	}
	if (added.length > 0) {
		console.log(`new errors:`);
		for (const s of added) console.log(`  + ${s}`);
		console.log(
			`typecheck:vue: ${added.length} new error(s) detected. Fix them or run \`node scripts/check-vue-types.mjs --update-baseline\` after review.`
		);
		process.exit(1);
	}
	console.log('typecheck:vue: passed (0 new errors).');
}

const signatures = parseSignatures(runVueTsc());
if (process.argv.includes('--update-baseline')) updateBaseline(signatures);
else check(signatures);
