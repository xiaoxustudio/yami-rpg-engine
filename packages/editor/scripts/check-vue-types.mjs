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
	if (res.error) {
		console.error(`typecheck:vue: failed to launch vue-tsc: ${res.error.message}`);
		process.exit(1);
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
	writeFileSync(BASELINE_FILE, JSON.stringify([...signatures].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)), null, '\t') + '\n');
	console.log(`baseline: updated ${BASELINE_FILE} (${signatures.length} errors).`);
}

function check(signatures) {
	const current = new Set(signatures);
	const baseline = new Set(loadBaseline());
	const added = [...current].filter((s) => !baseline.has(s));
	const fixed = [...baseline].filter((s) => !current.has(s));
	console.log(`vue-tsc errors: ${current.size} (baseline ${baseline.size}, new ${added.length}, fixed ${fixed.length})`);
	if (fixed.length > 0) {
		console.log(`fixed (consider updating baseline):`);
		for (const s of fixed) console.log(`  - ${s}`);
	}
	if (added.length > 0) {
		console.log(`new errors:`);
		for (const s of added) console.log(`  + ${s}`);
		console.log(`typecheck:vue: ${added.length} new error(s) detected. Fix them or run \`node scripts/check-vue-types.mjs --update-baseline\` after review.`);
		process.exit(1);
	}
	console.log('typecheck:vue: passed (0 new errors).');
}

const signatures = parseSignatures(runVueTsc());
if (process.argv.includes('--update-baseline')) updateBaseline(signatures);
else check(signatures);
