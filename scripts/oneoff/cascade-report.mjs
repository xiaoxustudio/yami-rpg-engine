/**
 * `any-hatches` 收口辅助：把 `tsc -p tsconfig.strict.json` 报出的错误**映射回源码行**。
 *
 * 用法：node scripts/oneoff/cascade-report.mjs <待收文件的仓库相对路径>
 *
 * 为什么需要它：摘掉某处 `Record<string, any>` / `[k: string]: any` 之后，tsc 会在**同一个
 * 口径**上报出一批「unknown 不能当 X 用」的错误 —— 那就是「到底被读了哪些键」的清单
 * （第 151 轮对 `ParticleLayerData`、本轮对 `CommandObjectShape` 都是这么逆推的）。
 * 直接把 tsc 的原始输出对齐到源码行，比逐条去 `read` 快得多。
 *
 * 只读、不改仓库；不参与任何门禁。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const target = process.argv[2];
if (!target) {
	console.error('用法：node scripts/oneoff/cascade-report.mjs <仓库相对路径>');
	process.exit(2);
}

const tsc = 'node_modules/.pnpm/typescript@5.9.3/node_modules/typescript/bin/tsc';
let out = '';
try {
	out = execFileSync(
		process.execPath,
		[tsc, '--noEmit', '-p', 'packages/editor/tsconfig.strict.json'],
		{
			encoding: 'utf8'
		}
	);
} catch (err) {
	out = `${err.stdout ?? ''}${err.stderr ?? ''}`;
}

const lines = readFileSync(target, 'utf8').split(/\r?\n/);
const rows = [];
const escaped = target
	.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
	.split('/')
	.pop();
for (const line of out.split(/\r?\n/)) {
	const m = new RegExp(`${escaped}\\((\\d+),(\\d+)\\): (error TS\\d+)`).exec(line);
	if (!m) continue;
	const n = Number(m[1]);
	rows.push(`${m[3]} L${n}: ${(lines[n - 1] ?? '').trim()}`);
}
console.log(`${target} 命中错误行：${rows.length}`);
console.log([...new Set(rows)].join('\n'));
