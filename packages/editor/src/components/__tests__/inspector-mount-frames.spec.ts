import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
	inspectorPages,
	inspectorMountFrames,
	inspectorSpecialTargets,
	inspectorImperativeOnly,
	deriveInspectorValue
} from '../inspector/inspector-pages';

const ROOT = join(__dirname, '..', '..', '..');
const INSPECTOR_PANEL = join(ROOT, 'src', 'components', 'layout', 'InspectorPanel.vue');
const APP_SHELL = join(ROOT, 'src', 'AppShell.vue');
const INSPECTOR_DIR = join(ROOT, 'src', 'components', 'inspector');
const CONTAINER_PAGE = join(ROOT, 'src', 'inspector', 'element-container-page.ts');

interface PageEntry {
	file: string;
	value: string;
	domId: string;
}

describe('inspector 挂载点对账（InspectorPanel ↔ AppShell ↔ 文件清单）', () => {
	const files = readdirSync(INSPECTOR_DIR)
		.filter((f) => f.endsWith('.vue'))
		.sort();
	const pages: PageEntry[] = files.map((file) => {
		const value = deriveInspectorValue(file);
		return {
			file,
			value,
			domId: inspectorSpecialTargets.has(value) ? value : `${value}-vue-mount`
		};
	});
	const frames = inspectorMountFrames;
	const frameByValue = new Map(frames.map((f) => [f.value, f]));

	it('扫描面非空（防止"目录搬走 ⇒ 用例静默变绿"）', () => {
		expect(files.length).toBeGreaterThan(40);
		expect(frames.length).toBeGreaterThan(files.length);
	});

	it('每个 inspector 页面都有挂载点', () => {
		expect(pages.filter((p) => !frameByValue.has(p.value)).map((p) => p.file)).toEqual([]);
	});

	it('挂载点 id 与 AppShell 推导的 Teleport 目标一致', () => {
		expect(
			pages
				.filter((p) => frameByValue.get(p.value)?.id !== p.domId)
				.map((p) => `${p.value}: frame id=${frameByValue.get(p.value)?.id} 推导=${p.domId}`)
		).toEqual([]);
	});

	it('glob 推导页覆盖目录里的全部 .vue 文件（防 glob 模式漂移）', () => {
		expect(inspectorPages.map((p) => p.value).sort()).toEqual(pages.map((p) => p.value).sort());
	});

	it('挂载点 value 唯一', () => {
		expect(frames.length).toBe(new Set(frames.map((f) => f.value)).size);
	});

	it('无 .vue 页面的挂载点恰好只有 uiContainer —— 且命令式页面仍在支撑它', () => {
		const pageValues = new Set(pages.map((p) => p.value));
		const orphans = frames.filter((f) => !pageValues.has(f.value)).map((f) => f.value);
		expect(orphans).toEqual([...inspectorImperativeOnly]);
		expect(readFileSync(CONTAINER_PAGE, 'utf8')).toMatch(/Inspector\.uiContainer\s*=/);
	});

	it('InspectorPanel 从共享清单渲染挂载点（防退回手写清单）', () => {
		expect(readFileSync(INSPECTOR_PANEL, 'utf8')).toMatch(
			/v-for="frame in inspectorMountFrames"/
		);
		expect(readFileSync(APP_SHELL, 'utf8')).toMatch(/inspectorPages/);
	});
});
