import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { Updater } from '../updater.ts';

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

		expect(Updater.getVersionNumber!('1.2.3-beta.1')).toBe(Updater.getVersionNumber!('1.2.3'));
		expect(Updater.getVersionNumber!('1.2.3+build.7')).toBe(Updater.getVersionNumber!('1.2.3'));

		expect(Updater.getVersionNumber!('')).toBe(0);
	});
});
