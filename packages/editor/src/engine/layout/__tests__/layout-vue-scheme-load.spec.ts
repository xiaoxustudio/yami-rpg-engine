import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
	Layout,
	setLayoutVueRenderEnabled,
	awaitVueLayoutLoad,
	resetPageLayoutState
} from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';
import {
	buildLayoutFixture,
	DIRECTORY_SCHEME,
	SCENE_SCHEME,
	registerLayout,
	type LayoutFixture,
	navValues,
	managerValues,
	selectedOf,
	visibleOf,
	clickNavItem,
	collectLeaves
} from './layout-spec-utils';
import type { LayoutSchemeData } from '../layout-scheme';

// M3b-2 双路开关（docs/layout-vue-plan.md 附录 E.1/E.2）：loadLayoutScheme 首载走
// Vue 渲染（mountVueGroupTree 水合叶子宿主）后，行为必须与命令式首载逐点等价。
// 全程默认关；用例显式开关并复位，避免污染其它用例。

type SchemeShape = LayoutSchemeData;

const asScheme = (scheme: unknown): SchemeShape => scheme as SchemeShape;

const vueLeafHosts = (page: HTMLElement) => collectLeaves(page.firstElementChild as HTMLElement);

const loadCommand = (fixture: LayoutFixture, key: string, scheme: SchemeShape): void => {
	registerLayout(fixture);
	fixture.workspace.switch(key);
	Layout.layout = { [key]: scheme } as never;
	Layout.loadLayoutScheme!(key);
};

/** 走真实引擎入口 loadLayoutScheme（Vue 开关开时异步），并等内部 Vue 加载完成。 */
const loadVue = async (
	fixture: LayoutFixture,
	key: string,
	scheme: SchemeShape
): Promise<HTMLElement> => {
	registerLayout(fixture);
	fixture.workspace.switch(key);
	Layout.layout = { [key]: scheme } as never;
	Layout.loadLayoutScheme!(key);
	await awaitVueLayoutLoad();
	return Layout.manager.active as HTMLElement;
};

beforeEach(() => {
	document.body.innerHTML = '';
	setLayoutVueRenderEnabled(false);
});

afterEach(() => {
	setLayoutVueRenderEnabled(false);
});

describe('M3b-2 Vue 渲染加载 vs 命令式 loadLayoutScheme', () => {
	it('Vue 首载：结构/叶子宿主/内容/激活与命令式一致，palette 同被清空', async () => {
		const cmdFixture = buildLayoutFixture();
		loadCommand(cmdFixture, 'directory', asScheme(DIRECTORY_SCHEME));

		const vueFixture = buildLayoutFixture();
		setLayoutVueRenderEnabled(true);
		const page = await loadVue(vueFixture, 'directory', asScheme(DIRECTORY_SCHEME));

		const cmdLeaves = collectLeaves(cmdFixture.directory.firstElementChild as HTMLElement);
		const vueLeaves = collectLeaves(page.firstElementChild as HTMLElement);

		expect(vueFixture.paletteNav.parentNode).toBeNull();
		expect(vueFixture.paletteManager.parentNode).toBeNull();
		expect(vueLeaves).toHaveLength(cmdLeaves.length);

		for (let i = 0; i < cmdLeaves.length; i++) {
			const vueIndex = vueLeaves[i].manager.index!;
			const cmdIndex = cmdLeaves[i].manager.index!;
			expect(navValues(vueLeaves[i].nav)).toEqual(navValues(cmdLeaves[i].nav));
			expect(managerValues(vueLeaves[i].manager)).toEqual(
				managerValues(cmdLeaves[i].manager)
			);
			expect(selectedOf(vueLeaves[i].nav)).toBe(selectedOf(cmdLeaves[i].nav));
			expect(visibleOf(vueLeaves[i].manager)).toEqual(visibleOf(cmdLeaves[i].manager));
			expect(vueIndex).toBe(cmdIndex);
			expect(vueLeaves[i].manager.active).toBe(vueFixture.items[vueIndex].page);
			expect(cmdLeaves[i].manager.active).toBe(cmdFixture.items[cmdIndex].page);
		}

		// 叶子宿主为 .vue 渲染（无命令式 attach 的 _initialized 标记）
		const vueNav = vueLeaves[0].nav as HTMLElement & { _initialized?: boolean };
		expect(vueNav._initialized).toBeUndefined();
		const cmdNav = cmdLeaves[0].nav as HTMLElement & { _initialized?: boolean };
		expect(cmdNav._initialized).toBe(true);
	});

	it('开关默认关：loadLayoutScheme 仍走命令式首载（_initialized 标记存在）', () => {
		const fixture = buildLayoutFixture();
		loadCommand(fixture, 'directory', asScheme(DIRECTORY_SCHEME));
		const leaves = collectLeaves(fixture.directory.firstElementChild as HTMLElement);
		const nav = leaves[0].nav as HTMLElement & { _initialized?: boolean };
		expect(nav._initialized).toBe(true);
		expect(selectedOf(leaves[0].nav)).toBe('project');
		expect(visibleOf(leaves[0].manager)).toEqual(['project']);
	});

	it('Vue 路径点击页签 + 二次加载恢复 lastValue，且不重建组树（根节点对象不变）', async () => {
		const fixture = buildLayoutFixture();
		setLayoutVueRenderEnabled(true);
		const page = await loadVue(fixture, 'directory', asScheme(DIRECTORY_SCHEME));
		const directoryRoot = page.firstElementChild as HTMLElement;

		const leaves = vueLeafHosts(page);
		clickNavItem(leaves[0].nav, 'inspector');
		expect(selectedOf(leaves[0].nav)).toBe('inspector');
		expect(visibleOf(leaves[0].manager)).toEqual(['inspector']);
		expect(leaves[0].manager.active).toBe(fixture.items.inspector.page);
		Layout.saveNavStates!();

		await loadVue(fixture, 'scene', asScheme(SCENE_SCHEME));
		Layout.manager.switch('directory');
		Layout.layout = { directory: asScheme(DIRECTORY_SCHEME) } as never;
		Layout.loadLayoutScheme!('directory'); // page.scheme === scheme → else 分支恢复
		await awaitVueLayoutLoad();

		const restoredLeaves = vueLeafHosts(page);
		expect(restoredLeaves[0].nav).toBe(leaves[0].nav);
		expect(page.firstElementChild).toBe(directoryRoot);
		expect(selectedOf(restoredLeaves[0].nav)).toBe('inspector');
		expect(visibleOf(restoredLeaves[0].manager)).toEqual(['inspector']);
		expect(restoredLeaves[0].manager.active).toBe(fixture.items.inspector.page);
	});

	it('重载（先删 page.scheme 再首载）：旧 Vue 树被卸载，宿主重建单根', async () => {
		const fixture = buildLayoutFixture();
		setLayoutVueRenderEnabled(true);
		const page = await loadVue(fixture, 'directory', asScheme(DIRECTORY_SCHEME));
		const oldRoot = page.firstElementChild as HTMLElement;

		resetPageLayoutState(page);
		await loadVue(fixture, 'directory', asScheme(DIRECTORY_SCHEME));

		const newRoot = page.firstElementChild as HTMLElement;
		expect(newRoot).not.toBe(oldRoot);
		expect(oldRoot.isConnected).toBe(false);
		expect(newRoot.querySelectorAll('group.group').length).toBeGreaterThan(0);
		// 单一组树根、无双根残留
		expect(Array.from(page.children).filter((child) => child.tagName === 'GROUP')).toHaveLength(
			1
		);
		const leaves = vueLeafHosts(page);
		expect(leaves).toHaveLength(2);
		expect(visibleOf(leaves[0].manager)).toEqual(['project']);
	});

	it('跨工作区往返：pageTargets 归属正确', async () => {
		const store = getLayoutStore();
		store.resetPageTargets();

		const fixture = buildLayoutFixture();
		setLayoutVueRenderEnabled(true);
		await loadVue(fixture, 'directory', asScheme(DIRECTORY_SCHEME));
		expect(store.pageTargets.scene).toBe(fixture.items.scene.page.parentNode);
		expect(store.pageTargets.project).toBe(fixture.items.project.page.parentNode);

		await loadVue(fixture, 'scene', asScheme(SCENE_SCHEME));
		expect(store.pageTargets.project).toBe(fixture.items.project.page.parentNode);
		expect(store.pageTargets.inspector).toBe(fixture.items.inspector.page.parentNode);

		Layout.manager.switch('directory');
		Layout.layout = { directory: asScheme(DIRECTORY_SCHEME) } as never;
		Layout.loadLayoutScheme!('directory');
		await awaitVueLayoutLoad();
		expect(store.pageTargets.scene).toBe(fixture.items.scene.page.parentNode);
		expect(fixture.directory.querySelectorAll('group.group').length).toBeGreaterThan(0);
	});

	it('双路快照等价：目录 scheme 各叶状态逐一相同', async () => {
		const cmdFixture = buildLayoutFixture();
		loadCommand(cmdFixture, 'directory', asScheme(DIRECTORY_SCHEME));
		const cmdLeaves = collectLeaves(cmdFixture.directory.firstElementChild as HTMLElement);
		const snapshot = (leaves: ReturnType<typeof collectLeaves>) =>
			leaves.map((leaf) => ({
				nav: navValues(leaf.nav),
				manager: managerValues(leaf.manager),
				selected: selectedOf(leaf.nav),
				visible: visibleOf(leaf.manager),
				index: leaf.manager.index
			}));

		const vueFixture = buildLayoutFixture();
		setLayoutVueRenderEnabled(true);
		const page = await loadVue(vueFixture, 'directory', asScheme(DIRECTORY_SCHEME));
		const vueLeaves = vueLeafHosts(page);

		expect(snapshot(vueLeaves)).toEqual(snapshot(cmdLeaves));
	});
});
