import { createPageManagerElement, type PageManagerApi } from '@ui-kit';
import {
	Layout,
	setItemPage,
	awaitVueLayoutLoad,
	refreshLayoutTargets,
	getNavLastValue,
	registerLayoutItems
} from '@app/engine/layout/layout.ts';
import * as elementUtils from '@app/utils/element-utils';

// layout 行为金标准共享 fixture
// 所有用例在 jsdom 中重建「palette + 宿主页 + items」，再走真实的 Layout 装载路径，
// 断言最终 DOM 形态（现状语义）。

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
		// 同时登记到引擎内部配对（生产路径由 Layout.initialize 登记）
		setItemPage(navItem, page);
		items[value] = navItem;
		list.push(navItem);
	}
	items.list = list;
	// fixture 走生产路径的 **palette 显式登记**（`registerLayoutItems`）：
	// 登记项优先，缺项才由**容器子树内**的 DOM 发现兜底。
	registerLayoutItems(
		list.map((navItem) => ({
			value: navItem.getAttribute('value') ?? '',
			nav: navItem,
			page: navItem.page
		}))
	);

	return { workspace, directory, scene, items, paletteNav, paletteManager };
}

let currentFixture: LayoutFixture | null = null;

export function registerLayout(fixture: LayoutFixture): void {
	currentFixture = fixture;
	Layout.manager = fixture.workspace as unknown as typeof Layout.manager;
	Layout.items = fixture.items as unknown as typeof Layout.items;
	Layout.layout = null;
	Layout.default = null;
}

/** 模拟 LayoutPalettePage 的「整壳 Teleport」：按叶子 tabs 把 palette 页签/页放进叶子宿主 */
export function placePaletteIntoLeaves(fixture: LayoutFixture | null = currentFixture): void {
	if (!fixture) return;
	const page =
		(Layout.manager as unknown as { active?: HTMLElement | null } | null)?.active ?? null;
	if (!page) return;
	const root = Array.from(page.children).find((child) => child.classList.contains('group'));
	if (!root) return;
	const leaves: Array<
		HTMLElement & { tabs?: string[]; nav?: HTMLElement; manager?: PageManagerApi }
	> = [];
	const walk = (el: Element): void => {
		if (!el.classList.contains('group')) return;
		const host = el as (typeof leaves)[number];
		if (host.nav !== undefined && host.manager !== undefined) {
			leaves.push(host);
			return;
		}
		for (const child of Array.from(el.children)) {
			if (child.classList.contains('group')) walk(child);
		}
	};
	walk(root);
	const { write } = elementUtils;
	for (const leaf of leaves) {
		for (const tab of leaf.tabs ?? []) {
			const item = fixture.items[tab];
			if (!item) continue;
			leaf.nav!.appendChild(item);
			if (item.page) leaf.manager!.appendChild(item.page);
		}
		// 与 teleport 装载一致：激活「既有选中 ?? 会话恢复值 ?? 首 tab」，并驱动 manager.switch
		// （YMNavBar.write 在 dataValue 相同——装载期已写过——时不再派发 write 事件）
		if (leaf.nav && (leaf.tabs ?? []).length !== 0) {
			const selectedEl = leaf.nav.querySelector('.nav-item.selected') as HTMLElement | null;
			const target =
				selectedEl?.getAttribute('value') ?? getNavLastValue(leaf.nav) ?? leaf.tabs![0];
			write(leaf.nav, target);
			const manager = leaf.manager as PageManagerApi & { switch?: (value: string) => void };
			manager.switch?.(target);
		}
	}
	refreshLayoutTargets();
}

/** 模拟 LayoutPaletteHost：palette 支架移出宿主页到 body 隐藏容器（teleport 形态） */
export function movePaletteToHolder(fixture: LayoutFixture | null = currentFixture): void {
	if (!fixture) return;
	let holder = document.body.querySelector('.layout-palette-holder') as HTMLElement | null;
	if (holder === null) {
		holder = document.createElement('div');
		holder.className = 'layout-palette-holder';
		holder.style.display = 'none';
		document.body.append(holder);
	}
	holder.append(fixture.paletteNav, fixture.paletteManager);
}

/**
 * 装载路径唯一（Vue 组树 + 整壳 Teleport）。fixture 环境没有 Vue palette 包装，
 * 因此装载前模拟 LayoutPaletteHost（palette 支架移出宿主页到 body 隐藏容器），
 * 装载后由 placePaletteIntoLeaves 模拟整壳落位，语义与真机一致。
 */
export async function mountScheme(key: string, scheme: SchemeNode): Promise<void> {
	movePaletteToHolder();
	Layout.layout = { [key]: scheme } as unknown as typeof Layout.layout;
	Layout.loadLayoutScheme!(key);
	await awaitVueLayoutLoad();
	placePaletteIntoLeaves();
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
