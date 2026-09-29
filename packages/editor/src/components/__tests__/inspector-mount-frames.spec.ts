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

/**
 * inspector 页面清单对账：`inspector-pages.ts`（唯一来源）↔ 文件清单 ↔ 挂载点
 * ↔ `AppShell.vue` 的 Teleport 目标。
 *
 * ## 为什么需要这个用例（2026-10-01；2026-10-01 去重后修订）
 *
 * 同一份 inspector 页面清单此前**维护在两处**：`AppShell.vue` 用 `import.meta.glob`
 * 从文件名推导 `{ value, target }` 并渲染 Teleport；`InspectorPanel.vue` 手写 43 个
 * `<div class="page-frame">` 当挂载点。两边靠**人脑**保持一致 —— 而它们**本来就该差一条**：
 *
 * `uiContainer` 没有 `.vue` 页面（它由命令式页面 `inspector/element-container-page.ts`
 * 支撑，`Inspector.uiContainer` 被 `engine/ui/ui-initialize.ts` 的 `container: 'uiContainer'`
 * 按名取用），所以 glob 推导一定**看不到**它，而挂载点**必须留着**。实测这条差值是
 * 43 − 42 = **1**，且**恰好只有** `uiContainer`。
 *
 * 现在清单收敛到 `inspector-pages.ts` 一份：本用例不再对账两份手写清单（结构上已无法漂移），
 * 而是守住三件事：
 *   1. glob 推导页 ↔ 目录里的 `.vue` 文件（防止 glob 模式搬家后静默少渲染页面）；
 *   2. 挂载点 id ↔ `AppShell` 推导的 Teleport 目标（挂载点与页面 value 对不上就会红）；
 *   3. `uiContainer` 这个「无 .vue 页面、但必须有挂载点」的例外仍恰好只此一个、且命令式页面仍在支撑它。
 */

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
		// 与 bridge-integrity.spec.ts 同一条教训：覆盖面变小必须红，不能绿。
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
		// 这一条是"不要顺手删掉它"的护栏：glob 看不到它，但 UI 引擎按名取用。
		expect(orphans).toEqual([...inspectorImperativeOnly]);
		// 例外之所以成立，是因为 `Inspector.uiContainer` 仍然被赋值。
		// 命令式页面一旦移除，这条断言会红，逼人重新判断那个挂载点是否还需要。
		expect(readFileSync(CONTAINER_PAGE, 'utf8')).toMatch(/Inspector\.uiContainer\s*=/);
	});

	it('InspectorPanel 从共享清单渲染挂载点（防退回手写清单）', () => {
		expect(readFileSync(INSPECTOR_PANEL, 'utf8')).toMatch(
			/v-for="frame in inspectorMountFrames"/
		);
		expect(readFileSync(APP_SHELL, 'utf8')).toMatch(/inspectorPages/);
	});
});
