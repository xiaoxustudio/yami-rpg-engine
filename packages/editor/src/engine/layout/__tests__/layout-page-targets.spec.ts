import { beforeEach, describe, expect, it } from 'vitest';
import { getLayoutStore } from '@app/stores/layout';
import { collectPageTargets } from '../layout-page-targets';
import {
	buildLayoutFixture,
	DIRECTORY_SCHEME,
	mountScheme,
	registerLayout,
	switchWorkspace
} from './layout-spec-utils';

// 运行时页面归属（:to 输入）：loadLayoutScheme/navDrop 收敛点后 store.pageTargets
// 应精确反映「value → 归属 group-manager」，跨工作区切换整表刷新。

describe('collectPageTargets 单元', () => {
	it('空根返回空映射', async () => {
		expect(collectPageTargets(null)).toEqual({});
		expect(collectPageTargets(document.createElement('div'))).toEqual({});
	});
});

describe('store.pageTargets 运行时同步', () => {
	const store = getLayoutStore();

	beforeEach(() => {
		store.resetPageTargets();
		document.body.innerHTML = '';
	});

	it('未加载任何工作区时为空', async () => {
		expect(Object.keys(store.pageTargets)).toHaveLength(0);
	});

	it('载入 directory 后每个 page-frame 归属其 leaf group-manager', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		expect(Object.keys(store.pageTargets)).toHaveLength(0);

		await mountScheme('directory', DIRECTORY_SCHEME);

		expect(store.pageTargets.project).toBe(fixture.items.project.page.parentNode);
		expect(store.pageTargets.inspector).toBe(fixture.items.inspector.page.parentNode);
		expect(store.pageTargets.scene).toBe(fixture.items.scene.page.parentNode);
		expect(Object.keys(store.pageTargets).sort()).toEqual(['inspector', 'project', 'scene']);
	});

	it('切换到 scene 工作区后整表刷新到新 group-manager', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);
		const directoryScene = store.pageTargets.scene;
		const directoryProject = store.pageTargets.project;

		switchWorkspace(fixture, 'scene');
		await mountScheme('scene', {
			end: 1,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['scene', 'project'] },
				{ end: 1, tabs: ['inspector'] }
			]
		});

		expect(store.pageTargets.scene).toBe(fixture.items.scene.page.parentNode);
		expect(store.pageTargets.project).toBe(fixture.items.project.page.parentNode);
		expect(store.pageTargets.scene).not.toBe(directoryScene);
		expect(store.pageTargets.project).not.toBe(directoryProject);
		expect(store.pageTargets.scene?.classList.contains('group-manager')).toBe(true);
	});

	it('切页签只改激活不改归属', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', DIRECTORY_SCHEME);

		const keysBefore = Object.keys(store.pageTargets).sort().join(',');
		const sceneTarget = store.pageTargets.scene;
		const nav = fixture.items.project.parentNode as HTMLElement;
		nav.querySelector('.nav-item[value="inspector"]')?.dispatchEvent(
			new PointerEvent('pointerdown', { bubbles: true, button: 0 })
		);

		expect(Object.keys(store.pageTargets).sort().join(',')).toBe(keysBefore);
		expect(store.pageTargets.scene).toBe(sceneTarget);
		expect(store.pageTargets.inspector).not.toBeNull();
	});
});
