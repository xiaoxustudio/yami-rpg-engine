import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Updater } from '../updater.ts';

/**
 * 编辑器版本**只有一个真源**：`packages/editor/package.json` 的 `version`。
 *
 * 这里刻意**从磁盘独立读一遍** package.json，而不是复用 `updater.ts` 里那个 import ——
 * 复用同一个模块会让断言退化成 `a === a` 的恒等式，抓不到"有人把字面量写回去"。
 * 同类思路见 `components/__tests__/sfc-event-binding.spec.ts`（独立计数 == 台账基线）。
 *
 * 用 `fileURLToPath` 转成普通路径再读：本仓测试跑在 jsdom 环境里，
 * 把 `URL` 对象直接交给 `readFileSync` 会报 `The URL must be of scheme file`（实测）。
 */
const here = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(here, '../../../../package.json'), 'utf8')) as {
	version: string;
};

describe('编辑器版本的真源', () => {
	it('Updater.latestEditorVersion 必须等于 package.json 的 version', () => {
		expect(Updater.latestEditorVersion).toBe(pkg.version);
	});

	it('getVersionNumber 必须能解析该版本号，且预发布/构建后缀不影响数值', () => {
		const num = Updater.getVersionNumber!(pkg.version);
		expect(Number.isFinite(num)).toBe(true);
		expect(num).toBeGreaterThan(0);

		// 发布流程允许 `v1.2.3-beta.1` 这类 tag（见 .github/workflows/release.yml）。
		// 它必须与 `1.2.3` 解析成同一个数 —— 否则预发布版本会把用户 config.json 里
		// 的"编辑器版本"记号写成 NaN，`checkForEditorUpdates` 的比较随之失效。
		expect(Updater.getVersionNumber!('1.2.3-beta.1')).toBe(Updater.getVersionNumber!('1.2.3'));
		expect(Updater.getVersionNumber!('1.2.3+build.7')).toBe(Updater.getVersionNumber!('1.2.3'));

		// 空值必须回落成 0 而不是 NaN（首启时 config 里可能还没有 version）
		expect(Updater.getVersionNumber!('')).toBe(0);
	});
});
