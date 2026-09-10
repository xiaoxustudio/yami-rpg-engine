import { createPageManagerElement, type PageManagerApi } from '@ui-kit';
import { Layout, setItemPage } from '@app/engine/layout/layout.ts';

// layout 行为金标准共享 fixture（docs/layout-vue-plan.md M1）
// 所有用例在 jsdom 中重建「palette + 宿主页 + items」，再驱动 Layout 命令式构建，
// 断言最终 DOM 形态（现状语义），供后续 Vue 化重写对照。

export type SchemeNode = {
	end: number;
	split?: string;
	children?: SchemeNode[];
	tabs?: string[];
};

export type LayoutLeaf = {
	nav: HTMLElement;
	manager: PageManagerApi;
};

export type LayoutItem = HTMLElement & { page: HTMLElement };

export type LayoutFixture = {
	workspace: PageManagerApi;
	directory: HTMLElement;
	scene: HTMLElement;
	items: Record<string, LayoutItem> & { list: LayoutItem[] };
	paletteNav: HTMLElement;
	paletteManager: HTMLElement;
};

export const TAB_VALUES = ['project', 'scene', 'inspector'] as const;

export const DIRECTORY_SCHEME: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['project', 'inspector'] },
		{ end: 1, tabs: ['scene'] }
	]
};

export const SCENE_SCHEME: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{ end: 0.5, tabs: ['scene', 'project'] },
		{ end: 1, tabs: ['inspector'] }
	]
};

export const NESTED_MERGE_SCHEME: SchemeNode = {
	end: 1,
	split: 'horizontal',
	children: [
		{
			end: 0.6,
			split: 'horizontal',
			children: [
				{ end: 0.5, tabs: ['project'] },
				{ end: 1, tabs: ['scene'] }
			]
		},
		{ end: 1, tabs: ['inspector'] }
	]
};

const createPageFrame = (value: string): HTMLElement => {
	const frame = document.createElement('div');
	frame.className = 'page-frame';
	frame.id = value;
	frame.setAttribute('value', value);
	return frame;
};

export function buildLayoutFixture(values: readonly string[] = [...TAB_VALUES]): LayoutFixture {
	document.body.innerHTML = '';
	const workspace = createPageManagerElement();
	workspace.id = 'workspace-page-manager';
	const directory = createPageFrame('directory');
	const scene = createPageFrame('scene');
	workspace.append(directory, scene);
	document.body.append(workspace);

	const paletteNav = document.createElement('div');
	paletteNav.id = 'layout-nav';
	const paletteManager = document.createElement('div');
	paletteManager.id = 'layout-page-manager';
	paletteManager.className = 'page-manager';
	directory.append(paletteNav, paletteManager);

	const items = {} as Record<string, LayoutItem> & { list: LayoutItem[] };
	const list: LayoutItem[] = [];
	for (const value of values) {
		const navItem = document.createElement('div') as unknown as LayoutItem;
		navItem.className = 'nav-item';
		navItem.draggable = true;
		navItem.setAttribute('value', value);
		paletteNav.append(navItem);
		const page = createPageFrame(value);
		paletteManager.append(page);
		navItem.page = page;
		// M5-a：同时登记到引擎内部配对（生产路径由 Layout.initialize 登记）
		setItemPage(navItem, page);
		items[value] = navItem;
		list.push(navItem);
	}
	items.list = list;

	return { workspace, directory, scene, items, paletteNav, paletteManager };
}

export function registerLayout(fixture: LayoutFixture): void {
	Layout.manager = fixture.workspace as unknown as typeof Layout.manager;
	Layout.items = fixture.items as unknown as typeof Layout.items;
	Layout.layout = null;
	Layout.default = null;
}

export function mountScheme(key: string, scheme: SchemeNode): void {
	Layout.layout = { [key]: scheme } as unknown as typeof Layout.layout;
	Layout.loadLayoutScheme!(key);
}

export function switchWorkspace(fixture: LayoutFixture, key: string): void {
	fixture.workspace.switch(key);
}

export const collectLeaves = (group: Element): LayoutLeaf[] => {
	const leaves: LayoutLeaf[] = [];
	for (const child of group.children) {
		if (child.classList.contains('group')) {
			if ((child as HTMLElement & { manager?: PageManagerApi }).manager) {
				leaves.push({
					nav: (child as HTMLElement & { nav: HTMLElement }).nav,
					manager: (child as HTMLElement & { manager: PageManagerApi }).manager
				});
			} else {
				leaves.push(...collectLeaves(child));
			}
		}
	}
	return leaves;
};

export const navValues = (nav: HTMLElement): string[] =>
	Array.from(nav.children)
		.filter((child) => child.classList.contains('nav-item'))
		.map((child) => child.getAttribute('value')!);

export const managerValues = (manager: HTMLElement): string[] =>
	Array.from(manager.children)
		.filter((child) => child.classList.contains('page-frame'))
		.map((child) => child.getAttribute('value')!);

export const selectedOf = (nav: HTMLElement): string | null =>
	nav.querySelector('.nav-item.selected')?.getAttribute('value') ?? null;

export const visibleOf = (manager: HTMLElement): string[] =>
	Array.from(manager.children)
		.filter(
			(child) => child.classList.contains('page-frame') && child.classList.contains('visible')
		)
		.map((child) => child.getAttribute('value')!);

export const clickNavItem = (nav: HTMLElement, value: string): void => {
	const item = nav.querySelector(`.nav-item[value="${value}"]`) as HTMLElement;
	item.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
};
