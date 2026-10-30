#!/usr/bin/env node
/**
 * 采集两个包的覆盖率（顺序执行，产出 <pkg>/coverage/coverage-summary.json）。
 *
 * 两个刻意的设计：
 *
 * 1. **顺序**跑，不并行：editor 的用例很重，与 ui-kit 并发会把 `template-localized.spec.ts`
 *    逼成超时红（CONTRIBUTING 里已有这条约定）。
 * 2. **不因用例失败而中断**：`reportOnFailure: true` 保证报告照样落盘，而"用例红不红"
 *    是 ci.yml tests job 的职责。两件事互相拖死过一次（2026-10-30：preview-server 的
 *    清理失败让整次覆盖率采集白跑）。所以这里只关心「两份 summary 有没有产出」。
 *
 * 用法：node scripts/coverage-run.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const TARGETS = [
	{
		name: 'editor',
		package: '@yami/editor',
		args: [
			'exec',
			'vitest',
			'run',
			'--coverage',
			'src/stores',
			'src/services',
			'src/utils',
			'src/data',
			'src/engine',
			'main'
		],
		summary: join(ROOT, 'packages/editor/coverage/coverage-summary.json')
	},
	{
		name: 'ui-kit',
		package: '@yami/ui-kit',
		args: ['exec', 'vitest', 'run', '--coverage'],
		summary: join(ROOT, 'packages/ui-kit/coverage/coverage-summary.json')
	}
];

let missing = 0;
for (const target of TARGETS) {
	console.log(`\n[coverage] ${target.name}：pnpm -F ${target.package} ${target.args.join(' ')}`);
	const started = Date.now();
	const result = spawnSync('pnpm', ['-F', target.package, ...target.args], {
		cwd: ROOT,
		stdio: 'inherit',
		shell: process.platform === 'win32'
	});
	const seconds = Math.round((Date.now() - started) / 1000);
	const ok = existsSync(target.summary);
	if (!ok) missing++;
	console.log(
		`[coverage] ${target.name}：退出码 ${result.status}，用时 ${seconds}s，summary ${
			ok ? '已产出' : '缺失'
		}`
	);
}

if (missing > 0) {
	console.error(
		`\n[coverage] ${missing} 个包的 coverage-summary.json 没产出 —— 检查 vitest 是否真的跑了 --coverage。`
	);
	process.exit(1);
}

console.log(
	`\n[coverage] 采集完成：${TARGETS.map((target) => relative(ROOT, target.summary)).join(' / ')}`
);
