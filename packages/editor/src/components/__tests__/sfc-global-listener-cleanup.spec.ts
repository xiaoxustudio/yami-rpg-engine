import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOTS = [resolve(process.cwd(), 'src'), resolve(process.cwd(), '../ui-kit/src')];
const GLOBAL_LISTEN = /(?:window|document)\.addEventListener\(/;
const CLEANUP = /removeEventListener|onUnmounted|onBeforeUnmount|onScopeDispose/;

/** 源码里挂了 window/document 监听却没有任何卸载手段时为 true。 */
function leaksGlobalListener(source: string): boolean {
	if (!GLOBAL_LISTEN.test(source)) return false;
	return !CLEANUP.test(source);
}

/** 递归列出目录下的 .vue 文件（跳过 __tests__）。 */
function vueFiles(dir: string): string[] {
	const out: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...vueFiles(full));
		else if (entry.name.endsWith('.vue')) out.push(full);
	}
	return out;
}

describe('SFC 的全局监听必须能卸载', () => {
	it('谓词：无监听不算泄漏；有监听无卸载算泄漏', () => {
		expect(leaksGlobalListener('const a = 1;')).toBe(false);
		expect(leaksGlobalListener("window.addEventListener('resize', f);")).toBe(true);
		expect(leaksGlobalListener("document.addEventListener('keydown', f);")).toBe(true);
		expect(
			leaksGlobalListener(
				"window.addEventListener('resize', f);\nonUnmounted(() => window.removeEventListener('resize', f));"
			)
		).toBe(false);
		expect(
			leaksGlobalListener("window.addEventListener('resize', f);\nonBeforeUnmount(() => {});")
		).toBe(false);
		expect(
			leaksGlobalListener(
				"window.addEventListener('resize', f);\nwindow.removeEventListener('resize', f);"
			)
		).toBe(false);
	});

	it('两包内的 .vue 全部合规', () => {
		const offenders: string[] = [];
		for (const root of ROOTS) {
			for (const file of vueFiles(root)) {
				if (leaksGlobalListener(readFileSync(file, 'utf8')))
					offenders.push(file.replace(root, ''));
			}
		}
		expect(offenders).toEqual([]);
	});
});
