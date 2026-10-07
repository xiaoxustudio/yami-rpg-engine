import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, type PropType } from 'vue';
import {
	Layout,
	awaitVueLayoutLoad,
	getPageScheme,
	resetPageLayoutState,
	setItemPage,
	setNavLastValue
} from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';
import LayoutPalettePage from '../../../components/layout/LayoutPalettePage.vue';
import type { LayoutSchemeData } from '../layout-scheme';

const DIRECTORY_SCHEME: LayoutSchemeData = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project', 'inspector'] },
		{ end: 1, tabs: ['scene'] }
	]
};

const SCENE_SCHEME: LayoutSchemeData = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['scene', 'project'] },
		{ end: 1, tabs: ['inspector'] }
	]
};

const VALUES = ['project', 'scene', 'inspector'] as const;

const mounts = { value: 0 };

const Marker = defineComponent({
	setup() {
		onMounted(() => {
			mounts.value += 1;
		});
		return () => h('span', { class: 'content-marker' }, 'content');
	}
});

const Palette = defineComponent({
	props: {
		values: { type: Array as PropType<readonly string[]>, required: true }
	},
	setup(props) {
		return () =>
			h(
				'div',
				{ class: 'palette' },
				props.values.map((value) =>
					h('div', { class: 'palette-entry', key: value }, [
						h(
							LayoutPalettePage,
							{ value, source: 'page' },
							{
								default: () =>
									h('div', { class: 'page-frame', value, id: `frame-${value}` }, [
										h(Marker)
									])
							}
						),
						h(
							LayoutPalettePage,
							{ value, source: 'tab' },
							{
								default: () =>
									h('div', { class: 'nav-item', value, id: `tab-${value}` }, [
										h('span', {}, value)
									])
							}
						)
					])
				)
			);
	}
});

type ManagerHost = HTMLElement & {
	index: string | null;
	active: HTMLElement | null;
	switch(value: string | null): void;
};

const leavesOf = (
	root: Element
): Array<HTMLElement & { tabs?: string[]; nav: HTMLElement; manager: ManagerHost }> => {
	const out: Array<HTMLElement & { tabs?: string[]; nav: HTMLElement; manager: ManagerHost }> =
		[];
	const walk = (el: Element): void => {
		if (!el.classList.contains('group')) return;
		const host = el as HTMLElement & { nav?: HTMLElement; manager?: ManagerHost };
		if (host.nav !== undefined && host.manager !== undefined) {
			out.push(host as (typeof out)[number]);
			return;
		}
		for (const child of Array.from(el.children)) {
			if (child.classList.contains('group')) walk(child);
		}
	};
	walk(root);
	return out;
};

const valuesOf = (container: HTMLElement, cls: string): string[] =>
	Array.from(container.children)
		.filter((child) => child.classList.contains(cls))
		.map((child) => child.getAttribute('value')!);

const selectedOf = (nav: HTMLElement): string | null =>
	nav.querySelector('.nav-item.selected')?.getAttribute('value') ?? null;

const visibleOf = (manager: HTMLElement): string[] =>
	Array.from(manager.children)
		.filter(
			(child) => child.classList.contains('page-frame') && child.classList.contains('visible')
		)
		.map((child) => child.getAttribute('value')!);

const frameOf = (value: string): HTMLElement => document.getElementById(`frame-${value}`)!;
const tabOf = (value: string): HTMLElement => document.getElementById(`tab-${value}`)!;

const clickTab = (nav: HTMLElement, value: string): void => {
	const item = nav.querySelector(`.nav-item[value="${value}"]`) as HTMLElement;
	item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
};

const pairItems = (values: readonly string[]): void => {
	for (const value of values) {
		setItemPage(tabOf(value), frameOf(value));
	}
};

const runLoad = async (host: HTMLElement, key: string, scheme: LayoutSchemeData): Promise<void> => {
	Layout.manager = { index: key, active: host } as never;
	Layout.layout = { [key]: scheme } as never;
	Layout.loadLayoutScheme!(key);
	await awaitVueLayoutLoad();
};

let paletteWrapper: ReturnType<typeof mount> | undefined;

beforeEach(() => {
	mounts.value = 0;
	getLayoutStore().resetPageTargets();
	getLayoutStore().resetTabTargets();
	document.body.innerHTML = '';
});

afterEach(async () => {
	paletteWrapper?.unmount();
	paletteWrapper = undefined;
	await nextTick();
});

describe('Teleport 装载端到端（唯一装载路径）', () => {
	it('首载：整壳页/页签经归属发布落位到叶子，激活首 tab；palette 壳节点不被命令式搬移', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		workspaceA.id = 'workspace-a';
		document.body.append(workspaceA);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);

		const root = workspaceA.firstElementChild as HTMLElement;
		expect(root.classList.contains('group')).toBe(true);
		const leaves = leavesOf(root);
		expect(leaves).toHaveLength(2);

		expect(frameOf('project').parentNode).toBe(leaves[0].manager);
		expect(frameOf('inspector').parentNode).toBe(leaves[0].manager);
		expect(frameOf('scene').parentNode).toBe(leaves[1].manager);
		expect(tabOf('project').parentNode).toBe(leaves[0].nav);
		expect(tabOf('inspector').parentNode).toBe(leaves[0].nav);
		expect(tabOf('scene').parentNode).toBe(leaves[1].nav);

		expect(valuesOf(leaves[0].manager, 'page-frame')).toEqual(['project', 'inspector']);
		expect(valuesOf(leaves[0].nav, 'nav-item')).toEqual(['project', 'inspector']);
		expect(valuesOf(leaves[1].nav, 'nav-item')).toEqual(['scene']);

		expect(selectedOf(leaves[0].nav)).toBe('project');
		expect(visibleOf(leaves[0].manager)).toEqual(['project']);
		expect(leaves[0].manager.index).toBe('project');
		expect(leaves[0].manager.active).toBe(frameOf('project'));
		expect(selectedOf(leaves[1].nav)).toBe('scene');
		expect(visibleOf(leaves[1].manager)).toEqual(['scene']);

		expect(getLayoutStore().pageTargets.project).toBe(leaves[0].manager);
		expect(getLayoutStore().tabTargets.scene).toBe(leaves[1].nav);
		expect(mounts.value).toBe(VALUES.length);
	});

	it('跨工作区：整壳节点换归属只搬家不重建；返回恢复 lastValue 且组树不重建', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		workspaceA.id = 'workspace-a';
		const workspaceB = document.createElement('div');
		workspaceB.className = 'page-frame';
		workspaceB.id = 'workspace-b';
		document.body.append(workspaceA, workspaceB);

		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);
		const directoryRoot = workspaceA.firstElementChild as HTMLElement;
		const directoryLeaves = leavesOf(directoryRoot);
		const projectFrame = frameOf('project');
		const sceneTab = tabOf('scene');
		clickTab(directoryLeaves[0].nav, 'inspector');
		expect(visibleOf(directoryLeaves[0].manager)).toEqual(['inspector']);
		setNavLastValue(directoryLeaves[0].nav, 'inspector');

		await runLoad(workspaceB, 'scene', SCENE_SCHEME);
		const sceneRoot = workspaceB.firstElementChild as HTMLElement;
		const sceneLeaves = leavesOf(sceneRoot);
		expect(sceneLeaves).toHaveLength(2);
		expect(frameOf('project')).toBe(projectFrame);
		expect(frameOf('project').parentNode).toBe(sceneLeaves[0].manager);
		expect(frameOf('scene').parentNode).toBe(sceneLeaves[0].manager);
		expect(frameOf('inspector').parentNode).toBe(sceneLeaves[1].manager);
		expect(tabOf('scene')).toBe(sceneTab);
		expect(valuesOf(sceneLeaves[0].nav, 'nav-item')).toEqual(['scene', 'project']);
		expect(valuesOf(sceneLeaves[0].manager, 'page-frame')).toEqual(['scene', 'project']);
		expect(directoryRoot.isConnected).toBe(true);
		expect(valuesOf(directoryLeaves[0].manager, 'page-frame')).toEqual([]);
		expect(visibleOf(sceneLeaves[0].manager)).toEqual(['scene']);
		expect(visibleOf(sceneLeaves[1].manager)).toEqual(['inspector']);
		expect(mounts.value).toBe(VALUES.length);

		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);
		expect(workspaceA.firstElementChild).toBe(directoryRoot);
		expect(frameOf('project')).toBe(projectFrame);
		expect(frameOf('project').parentNode).toBe(directoryLeaves[0].manager);
		expect(tabOf('scene')).toBe(sceneTab);
		expect(tabOf('scene').parentNode).toBe(directoryLeaves[1].nav);
		expect(valuesOf(directoryLeaves[0].manager, 'page-frame')).toEqual([
			'project',
			'inspector'
		]);
		expect(selectedOf(directoryLeaves[0].nav)).toBe('inspector');
		expect(visibleOf(directoryLeaves[0].manager)).toEqual(['inspector']);
		expect(mounts.value).toBe(VALUES.length);
	});

	it('重载（先删 page.scheme）：先收回旧树归属再卸载重建，节点身份不变、无双根', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		workspaceA.id = 'workspace-a';
		document.body.append(workspaceA);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);
		const oldRoot = workspaceA.firstElementChild as HTMLElement;
		const projectFrame = frameOf('project');

		resetPageLayoutState(workspaceA);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);

		const newRoot = workspaceA.firstElementChild as HTMLElement;
		expect(newRoot).not.toBe(oldRoot);
		expect(oldRoot.isConnected).toBe(false);
		expect(Array.from(workspaceA.children).filter((c) => c.tagName === 'GROUP')).toHaveLength(
			1
		);
		expect(frameOf('project')).toBe(projectFrame);
		expect(frameOf('project').isConnected).toBe(true);
		expect(leavesOf(newRoot)).toHaveLength(2);
		expect(visibleOf(leavesOf(newRoot)[0].manager)).toEqual(['project']);
		expect(mounts.value).toBe(VALUES.length);
	});

	it('跨组搬空 drop 后按 DOM 回写 scheme 并重挂载组树（drop 的 DOM 变更与 Vue 树重新一致）', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		workspaceA.id = 'workspace-a';
		workspaceA.setAttribute('value', 'directory');
		document.body.append(workspaceA);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);
		const root = workspaceA.firstElementChild as HTMLElement;
		const leaves = leavesOf(root);
		expect(leaves).toHaveLength(2);

		const store = getLayoutStore();
		const sceneFrame = frameOf('scene');
		store.dragging = {
			group: leaves[1],
			target: tabOf('scene'),
			hint: { classList: { contains: () => false } },
			location: { trigger: leaves[0].nav, target: leaves[0], direction: 'inside' },
			navs: [],
			regions: []
		} as never;
		Layout.navDrop!({ stopPropagation: () => {}, target: leaves[0].nav } as never);
		store.dragging = null;
		expect(
			Array.from(workspaceA.children).filter((child) => child.classList.contains('group'))
		).toHaveLength(1);

		await awaitVueLayoutLoad();
		await nextTick();

		expect(
			Array.from(workspaceA.children).filter((child) => child.classList.contains('group'))
		).toHaveLength(1);
		const nextLeaves = leavesOf(workspaceA.firstElementChild as HTMLElement);
		expect(nextLeaves).toHaveLength(1);
		expect(valuesOf(nextLeaves[0].nav, 'nav-item')).toEqual(['project', 'inspector', 'scene']);
		expect(valuesOf(nextLeaves[0].manager, 'page-frame')).toEqual([
			'project',
			'inspector',
			'scene'
		]);
		expect(frameOf('scene')).toBe(sceneFrame);
		expect(frameOf('scene').isConnected).toBe(true);
		expect(frameOf('scene').parentNode).toBe(nextLeaves[0].manager);
		expect(tabOf('scene').parentNode).toBe(nextLeaves[0].nav);

		expect(Layout.layout!.directory).toEqual({
			end: 1,
			tabs: ['project', 'inspector', 'scene']
		});
		expect(getPageScheme(workspaceA)).toBe(Layout.layout!.directory);

		expect(getLayoutStore().tabTargets.scene).toBe(nextLeaves[0].nav);
		expect(getLayoutStore().pageTargets.scene).toBe(nextLeaves[0].manager);
		expect(selectedOf(nextLeaves[0].nav)).toBe('scene');
		expect(visibleOf(nextLeaves[0].manager)).toEqual(['scene']);
		expect(mounts.value).toBe(VALUES.length);
	});

	it('宿主页残留 palette 空壳（#layout-content）时组根发现与拖拽注册仍可用', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		workspaceA.id = 'workspace-a';
		workspaceA.setAttribute('value', 'directory');
		const residual = document.createElement('div');
		residual.className = 'box';
		residual.id = 'layout-content';
		workspaceA.append(residual);
		document.body.append(workspaceA);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);

		const root = Array.from(workspaceA.children).find((child) =>
			child.classList.contains('group')
		) as HTMLElement;
		expect(root).toBeTruthy();
		expect(workspaceA.firstElementChild).toBe(residual);
		const leaves = leavesOf(root);
		expect(leaves).toHaveLength(2);
		expect(frameOf('project').parentNode).toBe(leaves[0].manager);
		expect(valuesOf(leaves[0].nav, 'nav-item')).toEqual(['project', 'inspector']);

		expect(Layout.getKeyGroups!()).toHaveLength(2);

		const head = document.createElement('div');
		document.body.append(head);
		Layout.heads = [head];
		const event = {
			dataTransfer: { setDragImage: () => {} },
			preventDefault: () => {},
			clientX: 0,
			clientY: 0
		};
		Layout.navDragstart!.call(leaves[0].nav, event as never);
		expect(workspaceA.querySelectorAll('group-region')).toHaveLength(2);
		Layout.navDragend!(event as never);
		expect(workspaceA.querySelectorAll('group-region')).toHaveLength(0);
		expect(mounts.value).toBe(VALUES.length);
	});
});
