import { beforeEach, describe, expect, it } from 'vitest';
import { Layout, getPageScheme } from '@app/engine/layout/layout.ts';
import {
	buildLayoutFixture,
	clickNavItem,
	collectLeaves,
	managerValues,
	mountScheme,
	navValues,
	registerLayout,
	selectedOf,
	switchWorkspace,
	visibleOf,
	type SchemeNode
} from './layout-spec-utils';
import '@app/utils/css';

const directoryScheme: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project', 'inspector'] },
		{ end: 1, tabs: ['scene'] }
	]
};

const sceneScheme: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['scene', 'project'] },
		{ end: 1, tabs: ['inspector'] }
	]
};

beforeEach(() => {
	document.body.innerHTML = '';
});

describe('Layout scheme 行为金标准（Vue 组树 + 整壳 Teleport）', () => {
	it('首载：palette 支架移入 body 隐藏容器（不再被 clear 摧毁），页/页签落位到叶子', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);

		const holder = document.body.querySelector('.layout-palette-holder');
		expect(holder).not.toBeNull();
		expect(holder?.contains(fixture.paletteNav)).toBe(true);
		expect(fixture.directory.querySelector('#layout-nav')).toBeNull();
		expect(fixture.directory.querySelector('#layout-page-manager')).toBeNull();

		const root = fixture.directory.firstElementChild as HTMLElement;
		expect(root.classList.contains('group')).toBe(true);
		expect(root.classList.contains('horizontal')).toBe(true);

		const leaves = collectLeaves(root);
		expect(leaves).toHaveLength(2);
		expect(navValues(leaves[0].nav)).toEqual(['project', 'inspector']);
		expect(managerValues(leaves[0].manager)).toEqual(['project', 'inspector']);
		expect(navValues(leaves[1].nav)).toEqual(['scene']);
		expect(managerValues(leaves[1].manager)).toEqual(['scene']);

		expect(fixture.items.project.parentNode).toBe(leaves[0].nav);
		expect(fixture.items.project.page.parentNode).toBe(leaves[0].manager);
		expect(getPageScheme(fixture.directory)).toBe(Layout.layout!.directory);
	});

	it('首次加载：每个 group 激活首 tab（nav selected + page visible）', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);

		const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		expect(selectedOf(leaves[0].nav)).toBe('project');
		expect(visibleOf(leaves[0].manager)).toEqual(['project']);
		expect(leaves[0].manager.active).toBe(fixture.items.project.page);
		expect(leaves[0].manager.index).toBe('project');

		expect(selectedOf(leaves[1].nav)).toBe('scene');
		expect(visibleOf(leaves[1].manager)).toEqual(['scene']);
		expect(leaves[1].manager.index).toBe('scene');
	});

	it('点击页签：nav write → manager.switch，selected/visible 迁移到目标页', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);

		const leaf = collectLeaves(fixture.directory.firstElementChild as HTMLElement)[0];
		clickNavItem(leaf.nav, 'inspector');

		expect(selectedOf(leaf.nav)).toBe('inspector');
		expect(visibleOf(leaf.manager)).toEqual(['inspector']);
		expect(leaf.manager.active).toBe(fixture.items.inspector.page);
		expect(leaf.manager.index).toBe('inspector');
	});

	it('跨工作区：同一批节点搬到新 group，旧 group 清空但保留', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);
		const directoryRoot = fixture.directory.firstElementChild as HTMLElement;
		const directoryLeaves = collectLeaves(directoryRoot);

		switchWorkspace(fixture, 'scene');
		await mountScheme('scene', sceneScheme);
		const sceneRoot = fixture.scene.firstElementChild as HTMLElement;
		const sceneLeaves = collectLeaves(sceneRoot);

		expect(sceneRoot.classList.contains('group')).toBe(true);
		expect(navValues(sceneLeaves[0].nav)).toEqual(['scene', 'project']);
		expect(managerValues(sceneLeaves[0].manager)).toEqual(['scene', 'project']);
		expect(navValues(sceneLeaves[1].nav)).toEqual(['inspector']);

		expect(fixture.items.scene.page.parentNode).toBe(sceneLeaves[0].manager);
		expect(fixture.items.project.page.parentNode).toBe(sceneLeaves[0].manager);
		expect(fixture.items.inspector.page.parentNode).toBe(sceneLeaves[1].manager);

		expect(managerValues(directoryLeaves[0].manager)).toEqual([]);
		expect(managerValues(directoryLeaves[1].manager)).toEqual([]);
		expect(navValues(directoryLeaves[0].nav)).toEqual([]);
		expect(directoryRoot.isConnected).toBe(true);
	});

	it('返回工作区：二次加载幂等恢复并把会话值选回上次页签', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);
		const directoryRoot = fixture.directory.firstElementChild as HTMLElement;
		const directoryLeaves = collectLeaves(directoryRoot);

		clickNavItem(directoryLeaves[0].nav, 'inspector');
		Layout.saveNavStates!();

		switchWorkspace(fixture, 'scene');
		await mountScheme('scene', sceneScheme);

		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);

		const leaves = collectLeaves(directoryRoot);
		expect(managerValues(leaves[0].manager)).toEqual(['project', 'inspector']);
		expect(managerValues(leaves[1].manager)).toEqual(['scene']);

		expect(selectedOf(leaves[0].nav)).toBe('inspector');
		expect(visibleOf(leaves[0].manager)).toEqual(['inspector']);
		expect(leaves[0].manager.active).toBe(fixture.items.inspector.page);

		expect(selectedOf(leaves[1].nav)).toBe('scene');
		expect(visibleOf(leaves[1].manager)).toEqual(['scene']);
	});

	it('saveLayoutScheme 往返：结构保真（end/split/tabs 顺序不变）', async () => {
		const fixture = buildLayoutFixture();
		registerLayout(fixture);
		switchWorkspace(fixture, 'directory');
		await mountScheme('directory', directoryScheme);
		const root = fixture.directory.firstElementChild as HTMLElement;

		clickNavItem(collectLeaves(root)[0].nav, 'inspector');

		const saved = Layout.saveLayoutScheme!(root as never);
		expect(saved).toEqual(directoryScheme);
	});
});
