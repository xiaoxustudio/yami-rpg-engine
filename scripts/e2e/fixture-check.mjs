#!/usr/bin/env node
/**
 * E2E fixture 与「工程数据 schema 版本」的一致性守卫。
 *
 * 背景：`scripts/e2e/fixture/` 是一份最小可打开的工程（只保留 Data/*.json），它的
 * `game.yamirpg.version` 必须等于当前工程数据 schema 纪元；这个纪元在仓库里有四处副本：
 *
 *   1. `packages/editor/src/services/updater/updater.ts` 的 `latestProjectVersion`（代码真源）
 *   2. `packages/template-arpg/package.json` 的 `yami.projectVersion`（模板侧）
 *   3. `packages/editor/src/module/packmeta.json` 的 `Project`（运行期写回的资源清单）
 *   4. `scripts/e2e/fixture/game.yamirpg` 的 `version`（E2E 工程）
 *
 * 前两处是「改 schema 时必须一起改」的既有约定；第 4 处没人盯着，schema 一升、fixture
 * 一旧，E2E 会以「工程打不开 / 版本过低弹窗」的形式失败，排查成本很高。这条守卫让它在
 * **起真机之前**就以一行明确报错失败。
 *
 * 用法：
 *   node scripts/e2e/fixture-check.mjs             校验（失败退出 1）
 *   node scripts/e2e/fixture-check.mjs --json      机器可读
 *   node scripts/e2e/fixture-check.mjs --selftest  门禁自证：四值一致判绿、任一漂移判红
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const AS_JSON = process.argv.includes('--json');

/** 四处版本来源：名字 + 读取方式（读失败时给出可执行的指引）。 */
const SOURCES = [
	{
		name: 'updater.latestProjectVersion',
		hint: 'packages/editor/src/services/updater/updater.ts',
		read: () => {
			const text = readFileSync(
				join(ROOT, 'packages/editor/src/services/updater/updater.ts'),
				'utf8'
			);
			return /latestProjectVersion:\s*'([^']+)'/.exec(text)?.[1];
		}
	},
	{
		name: 'template-arpg.yami.projectVersion',
		hint: 'packages/template-arpg/package.json',
		read: () =>
			JSON.parse(readFileSync(join(ROOT, 'packages/template-arpg/package.json'), 'utf8')).yami
				?.projectVersion
	},
	{
		name: 'packmeta.Project',
		hint: 'packages/editor/src/module/packmeta.json',
		read: () =>
			JSON.parse(readFileSync(join(ROOT, 'packages/editor/src/module/packmeta.json'), 'utf8'))
				.Project
	},
	{
		name: 'e2e-fixture.game.yamirpg.version',
		hint: 'scripts/e2e/fixture/game.yamirpg',
		read: () =>
			JSON.parse(readFileSync(join(ROOT, 'scripts/e2e/fixture/game.yamirpg'), 'utf8')).version
	}
];

/** 纯比较：返回不一致的分组（便于自证）。 */
export function findDrift(versions) {
	const byValue = new Map();
	for (const { name, value } of versions) {
		if (!value) continue;
		if (!byValue.has(value)) byValue.set(value, []);
		byValue.get(value).push(name);
	}
	return byValue;
}

function main() {
	const versions = SOURCES.map((source) => {
		let value;
		try {
			value = source.read();
		} catch {
			value = undefined;
		}
		return { name: source.name, value, hint: source.hint };
	});

	const missing = versions.filter((entry) => !entry.value);
	const groups = findDrift(versions);
	const ok = missing.length === 0 && groups.size === 1;

	if (AS_JSON) {
		console.log(
			JSON.stringify(
				{
					ok,
					versions,
					missing: missing.map((entry) => entry.name),
					groups: [...groups.entries()]
				},
				null,
				2
			)
		);
		if (!ok) process.exit(1);
		return;
	}

	if (missing.length > 0) {
		for (const entry of missing) console.error(`✗ 读不到版本：${entry.name}（${entry.hint}）`);
		process.exit(1);
	}

	if (groups.size > 1) {
		console.error('✗ 工程数据 schema 版本漂移：');
		for (const [value, names] of groups) console.error(`  ${value}  ←  ${names.join(', ')}`);
		console.error('');
		console.error(
			'  改 schema 时四处必须同步（fixture 旧了会让 E2E 以「工程打不开」的形式失败）：'
		);
		for (const entry of versions) console.error(`  · ${entry.name}（${entry.hint}）`);
		process.exit(1);
	}

	const [value] = [...groups.keys()];
	console.log(`✓ 工程数据 schema 版本一致：${value}（${versions.length} 处来源）`);
}

/** 自证：四值一致判绿，任一漂移判红（不依赖真实文件）。 */
function selftest() {
	const base = '1.0.147';
	const same = findDrift([
		{ name: 'a', value: base },
		{ name: 'b', value: base },
		{ name: 'c', value: base }
	]);
	if (same.size !== 1) {
		console.error('✗ 自证失败：一致的数据被判成漂移');
		process.exit(1);
	}

	const drift = findDrift([
		{ name: 'a', value: base },
		{ name: 'b', value: base },
		{ name: 'c', value: '1.0.150' }
	]);
	if (drift.size !== 2) {
		console.error('✗ 自证失败：漂移没被识别');
		process.exit(1);
	}

	console.log('✓ fixture 版本守卫自证通过：一致判绿 / 漂移判红');
}

if (process.argv.includes('--selftest')) selftest();
else main();
