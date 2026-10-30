#!/usr/bin/env node
/**
 * 覆盖率台账（coverage-ledger）—— 和 `migration-ledger` 同一套思路：**只许变小，不许悄悄变红**。
 *
 * 为什么需要它：仓库有 418 个 spec / 20 万行源码，但此前**没有任何覆盖率度量**
 * （vitest.config.ts 里连 coverage 段都没有）。于是「哪些目录在裸奔」只能靠猜，
 * 新增代码也可以理直气壮地零测试 —— 因为没有数字会被它拉低。
 *
 * 口径（刻意保持简单，避免门禁自己变成负担）：
 *   - **按目录聚合，用加权行覆盖率**（sum(covered)/sum(total)），不是"文件 pct 求平均"；
 *     后者会被大量 0 行小文件稀释，看不出真实缺口。
 *   - 目录 = 包内路径的前两段（`src/components`、`src/stores`、`main` …）；
 *   - 只卡 `lines`（分支/函数覆盖率对这段存量代码噪声太大，先只记录不判定）。
 *   - 容差 `tolerancePct`（默认 0.2pp）：覆盖率会因重构小幅抖动，硬卡相等会天天假红。
 *
 * 命令：
 *   node scripts/coverage-ledger.mjs                     # 打印台账 + 判定（失败退出 1）
 *   node scripts/coverage-ledger.mjs --json              # 机器可读
 *   node scripts/coverage-ledger.mjs --update-baseline   # 写回 scripts/coverage-baseline.json（只许降）
 *   node scripts/coverage-ledger.mjs --allow-raise       # 配合上行，显式允许抬高基线
 *   node scripts/coverage-ledger.mjs --selftest          # 门禁自证： fabricated 数据必须判红
 *
 * 前置：`pnpm coverage`（= 两个包各跑一次 vitest --coverage，产物在 <pkg>/coverage/）。
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE_PATH = join(ROOT, 'scripts/coverage-baseline.json');
const TOLERANCE_PCT = 0.2;

/** 两个包各自的覆盖率汇总产物 + 参与统计的源码根。 */
const PACKAGES = [
	{
		id: 'editor',
		dir: join(ROOT, 'packages/editor'),
		summary: join(ROOT, 'packages/editor/coverage/coverage-summary.json'),
		roots: ['src', 'main']
	},
	{
		id: 'ui-kit',
		dir: join(ROOT, 'packages/ui-kit'),
		summary: join(ROOT, 'packages/ui-kit/coverage/coverage-summary.json'),
		roots: ['src']
	}
];

const ARGV = new Set(process.argv.slice(2));
const AS_JSON = ARGV.has('--json');
const UPDATE = ARGV.has('--update-baseline');
const ALLOW_RAISE = ARGV.has('--allow-raise');
const SELFTEST = ARGV.has('--selftest');

const toPosix = (value) => value.split(sep).join('/');

/**
 * 包内相对路径 → 台账目录键：
 *   `main/apk.ts`        → `main`（一个大目录，不按文件拆）
 *   `src/stores/x.ts`    → `src/stores`
 *   `src/index.ts`       → `src`
 * 第二段是文件（带扩展名）时只取第一段，避免 `main` 被拆成十几个单文件行。
 */
export function areaOf(relativePath) {
	const parts = toPosix(relativePath).split('/');
	if (parts.length === 1) return parts[0].replace(/\.[^.]+$/, '');
	if (/\.[^.]+$/.test(parts[1])) return parts[0];
	return parts.slice(0, 2).join('/');
}

/**
 * 把 v8 的 coverage-summary 折成 { 目录键: { lines: 百分比, linesTotal, linesCovered } }。
 * 只统计 `roots` 下的文件，spec / 类型声明不计入分母（它们不是被测代码）。
 */
export function summarize(pkg, summary) {
	const areas = new Map();
	for (const [file, metrics] of Object.entries(summary)) {
		if (file === 'total') continue;
		const absolute = isAbsolute(file) ? file : join(pkg.dir, file);
		const relativePath = toPosix(relative(pkg.dir, absolute));
		if (relativePath.startsWith('..')) continue;
		if (
			!pkg.roots.some((root) => relativePath === root || relativePath.startsWith(`${root}/`))
		) {
			continue;
		}
		if (/\.spec\.ts$|\.test\.ts$|__tests__\/|\.d\.ts$|\.demo\.vue$/.test(relativePath))
			continue;

		const lines = metrics?.lines ?? { covered: 0, total: 0 };
		const key = `${pkg.id}:${areaOf(relativePath)}`;
		const bucket = areas.get(key) ?? { covered: 0, total: 0 };
		bucket.covered += lines.covered ?? 0;
		bucket.total += lines.total ?? 0;
		areas.set(key, bucket);
	}

	const result = {};
	for (const [key, bucket] of areas) {
		result[key] = {
			lines:
				bucket.total === 0
					? 100
					: Number(((bucket.covered / bucket.total) * 100).toFixed(2)),
			linesCovered: bucket.covered,
			linesTotal: bucket.total
		};
	}
	return result;
}

function readBaseline() {
	if (!existsSync(BASELINE_PATH)) return { version: 1, tolerancePct: TOLERANCE_PCT, areas: {} };
	try {
		return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
	} catch (error) {
		throw new Error(`基线文件损坏：${BASELINE_PATH}（${error.message}）`);
	}
}

/** 读两个包的汇总；缺任何一个都直接失败（不静默"跳过某个包"）。 */
export function loadCoverage(packages = PACKAGES) {
	const merged = {};
	for (const pkg of packages) {
		if (!existsSync(pkg.summary)) {
			throw new Error(
				`缺少 ${toPosix(relative(ROOT, pkg.summary))}：先跑 \`pnpm coverage\`（会生成 coverage-summary.json）`
			);
		}
		Object.assign(merged, summarize(pkg, JSON.parse(readFileSync(pkg.summary, 'utf8'))));
	}
	return merged;
}

/**
 * 判定：当前 vs 基线。返回 { rows, failures, added, removed }，不打印（便于自证）。
 * - 已存在的目录：当前 < 基线 - 容差 ⇒ 红；
 * - 基线里没有的新目录：红（要求显式 --update-baseline，避免"新目录天生没测试"混进来）；
 * - 基线里有、当前已消失的目录：只提示，不判红（目录被改名/合并是重构的常态）。
 */
export function evaluate(current, baseline, tolerancePct = baseline.tolerancePct ?? TOLERANCE_PCT) {
	const rows = [];
	const failures = [];
	const added = [];
	const removed = [];
	const keys = new Set([...Object.keys(baseline.areas ?? {}), ...Object.keys(current)]);

	for (const key of [...keys].sort()) {
		const base = baseline.areas?.[key];
		const now = current[key];
		if (!now) {
			removed.push(key);
			rows.push({
				key,
				baseline: base?.lines,
				current: null,
				delta: null,
				status: '目录已消失'
			});
			continue;
		}
		if (!base) {
			added.push(key);
			rows.push({
				key,
				baseline: null,
				current: now.lines,
				delta: null,
				status: '新目录（未入基线）'
			});
			failures.push(
				`${key}: 新目录未入基线（当前 ${now.lines}%），确认后跑 --update-baseline`
			);
			continue;
		}
		const delta = Number((now.lines - base.lines).toFixed(2));
		const below = now.lines < base.lines - tolerancePct;
		if (below)
			failures.push(`${key}: ${base.lines}% → ${now.lines}%（下降 ${Math.abs(delta)}pp）`);
		rows.push({
			key,
			baseline: base.lines,
			current: now.lines,
			delta,
			status: below ? '下降' : delta > 0 ? '上升' : '持平'
		});
	}

	return { rows, failures, added, removed };
}

function main() {
	if (SELFTEST) return selftest();

	const baseline = readBaseline();
	const current = loadCoverage();
	const { rows, failures, added, removed } = evaluate(current, baseline);

	if (UPDATE) {
		const next = {
			version: 1,
			tolerancePct: TOLERANCE_PCT,
			generatedAt: new Date().toISOString(),
			areas: {}
		};
		const raised = [];
		for (const row of rows) {
			if (row.current === null) continue;
			const lines =
				row.baseline === null
					? row.current
					: ALLOW_RAISE
						? row.current
						: Math.min(row.baseline, row.current);
			if (row.baseline !== null && lines > row.baseline) raised.push(row.key);
			next.areas[row.key] = {
				lines,
				linesCovered: current[row.key].linesCovered,
				linesTotal: current[row.key].linesTotal
			};
		}
		for (const key of raised) delete next.areas[key]; // 不允许抬高：保留旧基线
		writeFileSync(BASELINE_PATH, `${JSON.stringify(next, null, '\t')}\n`);
		console.log(`基线已更新：${toPosix(relative(ROOT, BASELINE_PATH))}`);
		if (raised.length > 0) {
			console.log(`  · 拒绝抬高（基线只许降）：${raised.join(', ')}`);
			console.log('  · 确实要抬高请显式加 --allow-raise 并说明理由');
		}
		const loweredCount = rows.filter((row) => row.delta !== null && row.delta < 0).length;
		if (loweredCount > 0) console.log(`  · 本批下降 ${loweredCount} 个目录`);
		return;
	}

	if (AS_JSON) {
		console.log(
			JSON.stringify(
				{ tolerancePct: baseline.tolerancePct, rows, failures, added, removed },
				null,
				2
			)
		);
	} else {
		printTable(rows, baseline);
	}

	if (failures.length > 0) {
		console.error('');
		for (const failure of failures) console.error(`✗ ${failure}`);
		process.exit(1);
	}
	console.log('✓ 覆盖率全部目录不低于基线。');
}

function printTable(rows, baseline) {
	const header = ['目录', '基线', '当前', '变化', '状态'];
	const body = rows.map((row) => [
		row.key,
		row.baseline === null ? '—' : `${row.baseline.toFixed(2)}%`,
		row.current === null ? '—' : `${row.current.toFixed(2)}%`,
		row.delta === null ? '—' : `${row.delta > 0 ? '+' : ''}${row.delta}pp`,
		row.status
	]);
	const widths = header.map((cell, index) =>
		Math.max(displayWidth(cell), ...body.map((line) => displayWidth(line[index])))
	);
	const format = (line) =>
		line.map((cell, index) => cell + ' '.repeat(widths[index] - displayWidth(cell))).join('  ');
	console.log('');
	console.log('覆盖率台账（coverage-ledger）—— 只许变小（行覆盖率，按目录加权）');
	console.log(`容差 ±${baseline.tolerancePct ?? TOLERANCE_PCT}pp`);
	console.log('');
	console.log(format(header));
	console.log('-'.repeat(widths.reduce((sum, width) => sum + width, 0) + widths.length * 2));
	for (const line of body) console.log(format(line));
	console.log('');
}

/** 中文按两格宽算，否则表格对不齐（台账是给人看的）。 */
function displayWidth(text) {
	let width = 0;
	for (const char of String(text)) width += /[\u4e00-\u9fff\uff00-\uffef]/.test(char) ? 2 : 1;
	return width;
}

/**
 * 自证：造一份「某个目录掉到 1%」的假数据，判定必须红；
 * 再造一份「完全持平」的数据，判定必须绿。门禁不能自证就是第二条永远绿的空检查。
 */
function selftest() {
	const fake = {
		version: 1,
		tolerancePct: TOLERANCE_PCT,
		areas: {
			'editor:src/stores': { lines: 80 },
			'editor:src/components': { lines: 40 }
		}
	};
	const good = { 'editor:src/stores': { lines: 80 }, 'editor:src/components': { lines: 40 } };
	const goodResult = evaluate(good, fake);
	if (goodResult.failures.length > 0) {
		console.error(`✗ 自证失败：持平数据被判红（${goodResult.failures.join('; ')}）`);
		process.exit(1);
	}

	const bad = { 'editor:src/stores': { lines: 12 }, 'editor:src/components': { lines: 40 } };
	const badResult = evaluate(bad, fake);
	if (badResult.failures.length === 0) {
		console.error('✗ 自证失败：覆盖率从 80% 掉到 12% 居然判绿');
		process.exit(1);
	}

	const addedResult = evaluate({ ...good, 'editor:src/new-area': { lines: 0 } }, fake);
	if (addedResult.failures.length === 0) {
		console.error('✗ 自证失败：未入基线的新目录没有判红');
		process.exit(1);
	}

	console.log('✓ 覆盖率台账自证通过：持平判绿 / 下降判红 / 新目录判红');
}

main();
