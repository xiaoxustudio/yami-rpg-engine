import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, onMounted, type PropType } from 'vue';
import { Layout, setLayoutVueRenderMode, awaitVueLayoutLoad } from '@app/engine/layout/layout.ts';
import { getLayoutStore } from '@app/stores/layout';
import LayoutPalettePage from '../../../components/layout/LayoutPalettePage.vue';
import type { LayoutSchemeData } from '../layout-scheme';

// M3b-2b Teleport 模式端到端（docs/layout-vue-plan.md 附录 F，默认关）：
// 引擎只渲染/挂载 Vue 组树并按叶子发布归属（页→manager、页签→nav），
// palette 的整壳 .page-frame / nav-item 经 LayoutPalettePage 落位——无命令式搬移。

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

// LayoutPanel palette 复刻：每 value 一组「整壳页 + 整壳页签」Teleport 包装
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

// 引擎 navPointerdown/拖拽假设 nav-item 带 .page（Layout.initialize 的配对语义）；palette 复刻后补上
const pairItems = (values: readonly string[]): void => {
	for (const value of values) {
		(tabOf(value) as HTMLElement & { page: HTMLElement }).page = frameOf(value);
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
	setLayoutVueRenderMode(0);
	document.body.innerHTML = '';
});

afterEach(async () => {
	paletteWrapper?.unmount();
	paletteWrapper = undefined;
	setLayoutVueRenderMode(0);
	await nextTick();
});

describe('M3b-2b Teleport 模式端到端（默认关，YM_LAYOUT_VUE_RENDER=teleport）', () => {
	it('首载：整壳页/页签经归属发布落位到叶子，激活首 tab；palette 壳节点不被命令式搬移', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		workspaceA.id = 'workspace-a';
		document.body.append(workspaceA);

		setLayoutVueRenderMode(2);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);

		const root = workspaceA.firstElementChild as HTMLElement;
		expect(root.classList.contains('group')).toBe(true);
		const leaves = leavesOf(root);
		expect(leaves).toHaveLength(2);

		// 帧物理位于叶子 manager、页签位于叶子 nav（整壳 Teleport 落位，无命令式 appendChild）
		expect(frameOf('project').parentNode).toBe(leaves[0].manager);
		expect(frameOf('inspector').parentNode).toBe(leaves[0].manager);
		expect(frameOf('scene').parentNode).toBe(leaves[1].manager);
		expect(tabOf('project').parentNode).toBe(leaves[0].nav);
		expect(tabOf('inspector').parentNode).toBe(leaves[0].nav);
		expect(tabOf('scene').parentNode).toBe(leaves[1].nav);

		// 收敛后的组内顺序 = tabs 顺序
		expect(valuesOf(leaves[0].manager, 'page-frame')).toEqual(['project', 'inspector']);
		expect(valuesOf(leaves[0].nav, 'nav-item')).toEqual(['project', 'inspector']);
		expect(valuesOf(leaves[1].nav, 'nav-item')).toEqual(['scene']);

		// 首 tab 激活
		expect(selectedOf(leaves[0].nav)).toBe('project');
		expect(visibleOf(leaves[0].manager)).toEqual(['project']);
		expect(leaves[0].manager.index).toBe('project');
		expect(leaves[0].manager.active).toBe(frameOf('project'));
		expect(selectedOf(leaves[1].nav)).toBe('scene');
		expect(visibleOf(leaves[1].manager)).toEqual(['scene']);

		// 归属表与 DOM 一致
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

		setLayoutVueRenderMode(2);

		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);
		const directoryRoot = workspaceA.firstElementChild as HTMLElement;
		const directoryLeaves = leavesOf(directoryRoot);
		const projectFrame = frameOf('project');
		const sceneTab = tabOf('scene');
		clickTab(directoryLeaves[0].nav, 'inspector');
		expect(visibleOf(directoryLeaves[0].manager)).toEqual(['inspector']);
		// 模拟 saveNavStates 记录的 lastValue
		(directoryLeaves[0].nav as HTMLElement & { lastValue?: string }).lastValue = 'inspector';

		// 进入 scene 工作区：帧/页签搬进 B 的组
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
		// A 的组树保留但被搬空；B 激活首 tab
		expect(directoryRoot.isConnected).toBe(true);
		expect(valuesOf(directoryLeaves[0].manager, 'page-frame')).toEqual([]);
		expect(visibleOf(sceneLeaves[0].manager)).toEqual(['scene']);
		expect(visibleOf(sceneLeaves[1].manager)).toEqual(['inspector']);
		expect(mounts.value).toBe(VALUES.length);

		// 返回 directory：else 恢复分支不重建组树，页签回 A，lastValue 恢复
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

		setLayoutVueRenderMode(2);
		await runLoad(workspaceA, 'directory', DIRECTORY_SCHEME);
		const oldRoot = workspaceA.firstElementChild as HTMLElement;
		const projectFrame = frameOf('project');

		delete (workspaceA as HTMLElement & { scheme?: unknown }).scheme;
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

	it('默认关时不受影响：命令式首载照常（对照组）', async () => {
		const paletteHost = document.createElement('div');
		document.body.append(paletteHost);
		paletteWrapper = mount(Palette, { props: { values: VALUES }, attachTo: paletteHost });
		pairItems(VALUES);

		const workspaceA = document.createElement('div');
		workspaceA.className = 'page-frame';
		document.body.append(workspaceA);
		// 命令式路径需要 items（palette 页/页签由引擎命令式搬移）；此处只验证 teleport 模式开关
		// 不影响默认路径路由：mode 0 时 loadLayoutScheme 同步构建命令式组树
		Layout.manager = { index: 'directory', active: workspaceA } as never;
		Layout.layout = { directory: DIRECTORY_SCHEME } as never;
		Layout.items = (() => {
			const items = {} as Record<string, HTMLElement & { page: HTMLElement }> & {
				list: (HTMLElement & { page: HTMLElement })[];
			};
			items.list = [];
			for (const value of VALUES) {
				const item = document.createElement('div') as unknown as HTMLElement & {
					page: HTMLElement;
				};
				item.className = 'nav-item';
				item.setAttribute('value', value);
				item.page = frameOf(value);
				items[value] = item;
				items.list.push(item);
			}
			return items;
		})() as never;

		Layout.loadLayoutScheme!('directory');
		await nextTick();
		expect(workspaceA.firstElementChild?.classList.contains('group')).toBe(true);
		const leaves = leavesOf(workspaceA.firstElementChild as HTMLElement);
		expect(leaves).toHaveLength(2);
		expect(leaves[0].nav.children.length).toBeGreaterThan(0);
	});
});
