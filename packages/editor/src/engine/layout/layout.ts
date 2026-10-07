import { elementDataOf } from '@ui-kit';
import { relate, hideDragImage, getRelativeCoords } from '@app/utils/element-utils';
import { engineEls } from '@app/engine/element-registry';
import { uiEls } from '@app/engine/ui/element-registry';
import { storesEls } from '@app/stores/element-registry';
import { renderDetached } from '@app/utils/dom';
import { getBrowserInstance } from '@app/stores/browser.ts';
import {
	on,
	off,
	addClass,
	removeClass,
	hasClass,
	rect,
	write,
	dispatchResizeEvent
} from '@app/utils/element-utils.ts';
import {
	createDragAndDropHintElement as createDragAndDropHint,
	type PageManagerApi
} from '@ui-kit';
import {
	toLayoutScheme,
	moveTabWithin,
	moveLayoutTab,
	findGroup,
	nodesOf,
	splitGroupWithTab,
	parseLayoutScheme,
	collapseRedundantSplits,
	clampEnds,
	type LayoutSchemeData,
	type LayoutTreeNode
} from './layout-scheme';
import { deserializeGroupElement, groupTreeElements } from './layout-deserialize';
import { findGroupOverlaps, type LayoutGeometryProbe } from './layout-diagnostics';
import { collectPageTargets } from './layout-page-targets';
import { mountVueGroupTree, type VueGroupTreeHandle } from './layout-vue-tree';
import { File } from '@app/file/file-system-core.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { GL } from '../webgl/webgl-init.ts';
import { Cursor } from '@app/composables/usePointerObjectWindow';
import { Animation } from '@app/animation/animation-window.ts';
import { Palette } from '@app/palette/palette.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { Home } from '@app/title/home-page.ts';
import { Title } from '@app/title/title-bar.ts';
import { getUIStore } from '@app/stores/ui';
import { DynamicShape } from '@app/types/shapes.ts';
import { h, nextTick, type VNode } from 'vue';

const vueTreeHandles = new WeakMap<HTMLElement, VueGroupTreeHandle>();
let lastVueSchemeLoad: Promise<void> | null = null;

export function awaitVueLayoutLoad(): Promise<void> {
	return lastVueSchemeLoad ?? Promise.resolve();
}

interface LayoutScheme {
	end: number;
	split?: string;
	children?: LayoutScheme[];
	tabs?: string[];
}

type LayoutItemElement = HTMLElement & {
	page?: HTMLElement;
};

type LayoutItems = Record<string, LayoutItemElement> & {
	list: LayoutItemElement[];
};

type LayoutGroupElement = HTMLElement & {
	split?: string;
	tabs?: string[];
	nav: HTMLElement;
	manager: PageManagerApi;
	border?: HTMLElement;
};

interface LayoutGroupData {
	end: number;
}

const groupData = (el: unknown): LayoutGroupData => elementDataOf<LayoutGroupData>(el);

type LayoutDragLocation = {
	trigger: HTMLElement;
	target: HTMLElement;
	direction: string;
};

type LayoutDragEvent = DragEvent & {
	group: HTMLElement | null;
	hint: HTMLElement;
	navs: HTMLElement[];
	regions: HTMLElement[];
};

type LayoutResizeEvent = {
	mode?: string;
	startX?: number;
	startY?: number;
	outer?: LayoutGroupElement;
	group?: LayoutGroupElement;
	end?: number;
	infos?: HTMLElement[];
};

function renderElement(vnode: VNode): HTMLElement {
	return renderDetached(vnode);
}

const layoutRootOf = (page: Element | null | undefined): HTMLElement | null => {
	if (!page) return null;
	const element = page as Element & { childNodes?: ArrayLike<ChildNode> };
	const children: ArrayLike<ChildNode> = element.children ?? element.childNodes ?? [];
	const list = Array.from(children).filter((child): child is Element => child?.nodeType === 1);
	for (const child of list) {
		if (hasClass(child, 'group')) return child as HTMLElement;
	}
	return (list[0] as HTMLElement | undefined) ?? null;
};

const hasAnyTabs = (node: LayoutScheme | null | undefined): boolean => {
	if (!node) return false;
	if (Array.isArray(node.tabs) && node.tabs.length !== 0) return true;
	return (node.children ?? []).some((child) => hasAnyTabs(child));
};

const groupChildrenOf = (parent: Element): LayoutGroupElement[] =>
	Array.from(parent.children).filter((child) => hasClass(child, 'group')) as LayoutGroupElement[];

/**
 * 写像素前把整棵组树的兄弟 `end` 收口成「严格单调且 ≤ 1」（见 `clampEnds`）。
 *
 * `Layout.updateGroups` 按 `end` 写内联 `left/width`，非单调的 end 会写出负宽、非有限值会写出
 * `NaNpx` —— 浏览器两种都拒收，元素保留旧几何（实机「两个面板互相压住」）。
 */
const clampEndsWithin = (group: LayoutGroupElement): void => {
	const children = groupChildrenOf(group);
	if (children.length !== 0) {
		const space =
			group.split === 'horizontal'
				? group.clientWidth
				: group.split === 'vertical'
					? group.clientHeight
					: 0;
		const ends = clampEnds(
			children.map((child) => groupData(child).end),
			space
		);
		children.forEach((child, index) => {
			groupData(child).end = ends[index];
		});
	}
	for (const child of children) clampEndsWithin(child);
};

const prevGroupOf = (group: Element): LayoutGroupElement | null => {
	let node: Element | null = group.previousElementSibling;
	while (node !== null && !hasClass(node, 'group')) node = node.previousElementSibling;
	return node as LayoutGroupElement | null;
};

const nextGroupOf = (group: Element): LayoutGroupElement | null => {
	let node: Element | null = group.nextElementSibling;
	while (node !== null && !hasClass(node, 'group')) node = node.nextElementSibling;
	return node as LayoutGroupElement | null;
};

const pageSchemes = new WeakMap<HTMLElement, LayoutScheme>();
const pageTrees = new WeakMap<HTMLElement, LayoutScheme>();
const navLastValues = new WeakMap<HTMLElement, string | null>();
const itemPages = new WeakMap<HTMLElement, HTMLElement>();

export const getPageScheme = (page: HTMLElement): LayoutScheme | undefined => pageSchemes.get(page);

export const resetPageLayoutState = (page: HTMLElement): void => {
	pageSchemes.delete(page);
	pageTrees.delete(page);
};

export const clearLayoutMirror = (page: HTMLElement): void => {
	pageTrees.delete(page);
};

export const getNavLastValue = (nav: HTMLElement): string | null => navLastValues.get(nav) ?? null;

export const setNavLastValue = (nav: HTMLElement, value: string | null): void => {
	navLastValues.set(nav, value);
};

export const setItemPage = (item: HTMLElement, page: HTMLElement): void => {
	itemPages.set(item, page);
};

export const refreshLayoutTargets = (): void => {
	syncLayoutMirror(Layout.manager?.active as HTMLElement | null | undefined);
	syncPageTargets(Layout.manager);
};

export interface RegisteredLayoutItem {
	value: string;
	nav?: HTMLElement;
	page?: HTMLElement;
}

const registeredLayoutItems = new Map<string, RegisteredLayoutItem>();

export const registerLayoutItems = (entries: RegisteredLayoutItem[]): void => {
	for (const entry of entries) {
		if (entry.value === '') continue;
		const current = registeredLayoutItems.get(entry.value) ?? { value: entry.value };
		if (entry.nav !== undefined) current.nav = entry.nav;
		if (entry.page !== undefined) current.page = entry.page;
		registeredLayoutItems.set(entry.value, current);
	}
};

export const resetRegisteredLayoutItems = (): void => {
	registeredLayoutItems.clear();
};

const syncLayoutMirror = (page: HTMLElement | null | undefined): void => {
	if (!page) return;
	const root = layoutRootOf(page);
	if (root === null) {
		pageTrees.delete(page);
		return;
	}
	pageTrees.set(page, toLayoutScheme(deserializeGroupElement(root)));
};

const syncPageTargets = (
	manager: {
		active: Element | null;
	} | null
): void => {
	if (manager === null) return;
	const root = layoutRootOf(manager.active);
	getLayoutStore().setPageTargets(collectPageTargets(root));
};

const collectLeafHosts = (root: Element | null): LayoutGroupElement[] => {
	const out: LayoutGroupElement[] = [];
	if (root === null) return out;
	const walk = (el: Element): void => {
		if (!hasClass(el, 'group')) return;
		const host = el as LayoutGroupElement;
		if (host.nav !== undefined && host.manager !== undefined) {
			out.push(host);
			return;
		}
		for (const child of Array.from(el.children)) {
			if (hasClass(child, 'group')) walk(child);
		}
	};
	walk(root);
	return out;
};

const hostedValues = (root: Element | null): string[] => {
	const values: string[] = [];
	for (const leaf of collectLeafHosts(root)) {
		for (const tab of leaf.tabs ?? []) values.push(tab);
	}
	return values;
};

const orderLeafHostChildren = (leaf: LayoutGroupElement): void => {
	const { nav, manager, tabs } = leaf;
	if (nav === undefined || manager === undefined || tabs === undefined) return;
	for (const tab of tabs) {
		for (const child of Array.from(nav.children)) {
			if (
				hasClass(child, 'nav-item') &&
				(child as HTMLElement).getAttribute('value') === tab
			) {
				nav.appendChild(child);
				break;
			}
		}
		for (const child of Array.from(manager.children)) {
			if (
				hasClass(child, 'page-frame') &&
				(child as HTMLElement).getAttribute('value') === tab
			) {
				manager.appendChild(child);
				break;
			}
		}
	}
};

/**
 * 把一个叶子的页框可见性钉到「刚激活的页签」：只有这一个 `.visible`。
 *
 * 为什么需要：页框的 `.visible` 是**旧组**留下的 —— Teleport 把整壳页面搬进新 manager 时不会清，
 * 而 `switch()` 有「index 未变就早退」的短路（`if (last !== value)`）⇒ 该叶子可能同时留着两个
 * `.visible` 页框。页框是 `position: absolute; inset: 0`，两页于是**完全叠在一起**：实机表现
 * 就是「切换页签后，另一个面板的头部（播放栏/刻度尺等）与内容还画在原处」。
 */
const syncLeafVisiblePages = (leaf: LayoutGroupElement, value: string): void => {
	const manager = leaf.manager;
	if (manager === undefined) return;
	for (const child of Array.from(manager.children)) {
		if (!hasClass(child, 'page-frame')) continue;
		const active = (child as HTMLElement).getAttribute('value') === value;
		if (active) addClass(child, 'visible');
		else removeClass(child, 'visible');
	}
};

/** 激活叶子上的一个页签：写 nav（走既有 write → manager.switch 通路）后把可见性收敛到它 */
const activateLeafTab = (leaf: LayoutGroupElement, value: string | undefined): void => {
	if (value === undefined || leaf.nav === undefined) return;
	write(leaf.nav, value);
	syncLeafVisiblePages(leaf, value);
};

const navTabsOf = (nav: HTMLElement | undefined): string[] => {
	if (!nav) return [];
	const values: string[] = [];
	for (const child of Array.from(nav.children)) {
		if (hasClass(child, 'nav-item')) {
			const value = (child as HTMLElement).getAttribute('value');
			if (value !== null) values.push(value);
		}
	}
	return values;
};

const applyTabDropWithin = (
	group: LayoutGroupElement,
	item: LayoutItemElement,
	trigger: HTMLElement
): void => {
	const { nav, manager } = group;
	const value = item.getAttribute('value') ?? '';
	const anchor = hasClass(trigger, 'nav-item') ? trigger.getAttribute('value') : null;
	const tabs = moveTabWithin(group.tabs ?? navTabsOf(nav), value, anchor);
	group.tabs = tabs;
	for (const tab of tabs) {
		for (const child of Array.from(nav.children)) {
			if (hasClass(child, 'nav-item') && child.getAttribute('value') === tab) {
				nav.appendChild(child);
				break;
			}
		}
		for (const child of Array.from(manager.children)) {
			if (hasClass(child, 'page-frame') && child.getAttribute('value') === tab) {
				manager.appendChild(child);
				break;
			}
		}
	}
	const page = itemPages.get(item as HTMLElement);
	if (page) {
		(page as HTMLElement & { width: unknown; height: unknown }).width = null;
		(page as HTMLElement & { width: unknown; height: unknown }).height = null;
	}
};

type StructuralDropInput = {
	sGroup: LayoutGroupElement;
	target: LayoutGroupElement;
	direction: string;
	tab: string | undefined;
	trigger: HTMLElement;
	hint: { width: number; height: number };
};

/** 页签落到目标叶子里的插入下标：trigger 是 nav-item 就插到它前面，否则追加（与命令式版同语义） */
const dropInsertIndex = (
	targetLeaf: LayoutGroupElement,
	trigger: HTMLElement,
	tab: string
): number => {
	const tabs = (targetLeaf.tabs ?? []).filter((value) => value !== tab);
	if (!hasClass(trigger, 'nav-item')) return tabs.length;
	const value = trigger.getAttribute('value');
	const index = value === null ? -1 : tabs.indexOf(value);
	return index === -1 ? tabs.length : index;
};

/**
 * 结构性 drop 的**数据路径**入口。
 *
 * 做法：从当前 DOM 反读一次（`saveLayoutScheme` + `groupTreeElements`：两者按同一先序口径
 * 枚举容器与叶子）拿到「当前树」，在**数据**上算出下一棵树（`moveLayoutTab` / `splitGroupWithTab`），
 * 写回 `layout[key]` 后整树重挂载。
 * 挂载完成后只剩**像素口径的尺寸收敛**（`mergeGroups` + `setGroupSize`）—— 那两步仍按原实现调用，
 * 因为它们的入参是真实像素（`clientWidth/clientLeft` + 拖拽 hint），jsdom 里 `space === 0` 走不到公式。
 *
 * 返回重挂载的 Promise；无 Vue 组树（手工搭建 DOM 的测试环境）或找不到落点时返回 `null`。
 */
const applyStructuralDrop = (input: StructuralDropInput): Promise<void> | null => {
	const tab = input.tab;
	const page = Layout.manager?.active as HTMLElement | null | undefined;
	const root = layoutRootOf(page);
	if (tab === undefined || !page || root === null || !hasClass(root, 'group')) return null;
	if (vueTreeHandles.get(page) === undefined) return null;

	const nodeElements = groupTreeElements(root);
	const sourceIndex = nodeElements.findIndex((element) => element === input.sGroup);
	const targetIndex = nodeElements.findIndex((element) => element === input.target);
	if (sourceIndex === -1 || targetIndex === -1) return null;

	const key = page.getAttribute('value') ?? Layout.manager?.index ?? '';
	const current = parseLayoutScheme(Layout.saveLayoutScheme!(root) as LayoutSchemeData);
	const ids = nodesOf(current).map((node) => node.id);
	const sourceLeafId = findGroup(current, ids[sourceIndex])?.id;
	if (sourceLeafId === undefined) return null;
	const direction = input.direction;
	let next: LayoutTreeNode | null;
	if (direction === 'inside') {
		const targetLeafId = findGroup(current, ids[targetIndex])?.id;
		if (targetLeafId === undefined) return null;
		next = moveLayoutTab(
			current,
			sourceLeafId,
			targetLeafId,
			tab,
			dropInsertIndex(input.target, input.trigger, tab)
		);
	} else if (
		direction === 'left' ||
		direction === 'right' ||
		direction === 'top' ||
		direction === 'bottom'
	) {
		next = splitGroupWithTab(current, ids[targetIndex], sourceLeafId, tab, direction);
	} else {
		return null;
	}
	if (next === null) return null;

	const scheme = toLayoutScheme(next);
	const layout = (Layout.layout ??= {} as Record<string, LayoutScheme>);
	layout[key] = scheme;
	pageSchemes.set(page, scheme);

	return (async () => {
		const previous = lastVueSchemeLoad;
		if (previous !== null) await previous.catch(() => {});
		await mountSchemeIntoPage(page, scheme, tab);

		const mounted = layoutRootOf(page) as LayoutGroupElement | null;
		if (mounted === null) return;
		if (input.direction !== 'inside') {
			Layout.mergeGroups!();
			const newLeaf = collectLeafHosts(mounted).find((leaf) =>
				(leaf.tabs ?? []).includes(tab)
			);
			if (newLeaf !== undefined) {
				const movedPage = Array.from(newLeaf.manager.children).find(
					(child) => child.getAttribute('value') === tab
				) as (HTMLElement & { width: unknown; height: unknown }) | undefined;
				if (movedPage !== undefined) {
					movedPage.width = null;
					movedPage.height = null;
				}
				Layout.setGroupSize!(
					newLeaf,
					input.hint,
					input.direction === 'left' || input.direction === 'top' ? 'forward' : 'backward'
				);
			}
		}
		clampEndsWithin(mounted);
		Layout.updateGroups!(true);
		const finalScheme = toLayoutScheme(
			collapseRedundantSplits(
				parseLayoutScheme(Layout.saveLayoutScheme!(mounted) as LayoutSchemeData)
			)
		);
		layout[key] = finalScheme;
		pageSchemes.set(page, finalScheme);
		syncLayoutMirror(page);
		syncPageTargets(Layout.manager);
	})();
};

const publishLeafTargets = (root: Element | null): LayoutGroupElement[] => {
	const leaves = collectLeafHosts(root);
	const pages: Record<string, HTMLElement> = {};
	const tabs: Record<string, HTMLElement> = {};
	for (const leaf of leaves) {
		for (const tab of leaf.tabs ?? []) {
			pages[tab] = leaf.manager;
			tabs[tab] = leaf.nav;
		}
	}
	getLayoutStore().setPageTargets(pages);
	getLayoutStore().setTabTargets(tabs);
	return leaves;
};

export const Layout: DynamicShape = {
	manager: null,
	items: null as LayoutItems | null,
	heads: null as HTMLElement[] | null,
	layouts: null,
	layout: null as Record<string, LayoutScheme> | null,
	default: null,
	initialize: null as (() => void) | null,
	switchLayout: null as ((layout: Record<string, LayoutScheme>) => void) | null,
	updateGroups: null as ((force?: boolean) => void) | null,
	updateGroupTabs: null as ((group: LayoutGroupElement) => void) | null,
	updateGroupInfo: null as (() => void) | null,
	logDiagnostics: null as ((verbose?: boolean) => void) | null,
	mergeGroups: null as (() => void) | null,
	setGroupSize: null as
		| ((
				group: LayoutGroupElement,
				hint: { width: number; height: number },
				direction: 'forward' | 'backward'
		  ) => void)
		| null,
	computeSizesBefore: null as ((group: LayoutGroupElement) => void) | null,
	computeSizesAfter: null as ((group: LayoutGroupElement) => void) | null,
	updateHint: null as ((location: LayoutDragLocation | null) => void) | null,
	getKeyGroups: null as (() => LayoutGroupElement[]) | null,
	getGroupOfElement: null as ((element: HTMLElement) => LayoutGroupElement | null) | null,
	readyToFocus: null as ((element: HTMLElement) => void) | null,
	activateLayoutPage: null as ((page: HTMLElement | null | undefined) => boolean) | null,
	enableFocusableElements: null as (() => void) | null,
	disableFocusableElements: null as (() => void) | null,
	saveNavStates: null as (() => void) | null,
	saveLayoutScheme: null as ((rootGroup?: LayoutGroupElement) => LayoutScheme) | null,
	loadLayoutScheme: null as ((key?: string) => void) | null,
	loadLayoutSchemeVueTeleport: null as
		| ((
				key: string,
				scheme: LayoutScheme,
				page: HTMLElement,
				isFirst: boolean
		  ) => Promise<void>)
		| null,
	saveToConfig: null as
		| ((config: { layout?: Record<string, LayoutScheme> | null }) => void)
		| null,
	loadFromConfig: null as
		| ((config: { layout?: Record<string, LayoutScheme> | null }) => void)
		| null,
	windowResize: null as ((event: EditorEvent) => void) | null,
	windowLocalize: null as ((event: EditorEvent) => void) | null,
	pageSwitch: null as ((event: EditorEvent) => void) | null,
	navWrite: null as ((event: EditorEvent) => void) | null,
	navPointerdown: null as ((event: { button: number; target: LayoutItemElement }) => void) | null,
	navDragstart: null as ((event: LayoutDragEvent) => void) | null,
	navDragend: null as ((event: EditorEvent) => void) | null,
	navDragenter: null as ((event: DragEvent) => void) | null,
	navDragleave: null as ((event: EditorEvent) => void) | null,
	navDragover: null as ((event: DragEvent) => void) | null,
	navDrop: null as ((event: EditorEvent) => void) | null,
	regionDragleave: null as ((event: EditorEvent) => void) | null,
	regionDragover: null as ((event: DragEvent) => void) | null,
	borderPointerdown: null as ((event: YamiMouseEvent & LayoutResizeEvent) => void) | null,
	pointerup: null as ((event?: EditorEvent) => void) | null,
	pointermove: null as ((event: EditorEvent) => void) | null
};

Layout.initialize = function () {
	this.manager = engineEls.get('workspace-page-manager') as YamiElement;
	const nav = engineEls.get('layout-nav') as YamiElement;
	const manager = engineEls.get('layout-page-manager') as YamiElement;
	const items = (this.items = {} as LayoutItems);
	const isElement = (node: Node): boolean => node.nodeType === 1;
	const paletteNavs = Array.from(nav?.childNodes ?? []).filter(isElement) as HTMLElement[];
	const palettePages = Array.from(manager?.childNodes ?? []).filter(isElement) as HTMLElement[];
	const domNavs =
		paletteNavs.length !== 0
			? paletteNavs
			: (Array.from(nav?.querySelectorAll('.nav-item[value]') ?? []) as HTMLElement[]);
	const domPages =
		palettePages.length !== 0
			? palettePages
			: (
					Array.from(
						manager?.querySelectorAll('.page-frame[value]') ?? []
					) as HTMLElement[]
				).filter(
					(frame) => frame.id !== '' || frame.closest('#layout-page-manager') !== null
				);
	const navItems: HTMLElement[] = [];
	const pageFrames: HTMLElement[] = [];
	const seenValues = new Set<string>();
	for (const entry of registeredLayoutItems.values()) {
		if (entry.nav !== undefined) navItems.push(entry.nav);
		if (entry.page !== undefined) pageFrames.push(entry.page);
		if (entry.value !== undefined) seenValues.add(entry.value);
	}
	for (const node of [...domNavs, ...domPages]) {
		const value = node.getAttribute('value');
		if (value !== null && seenValues.has(value)) continue;
		if (node.classList.contains('nav-item')) navItems.push(node);
		else pageFrames.push(node);
	}
	for (const item of navItems) {
		const key = item.getAttribute('value');
		item.draggable = true;
		items[key!] = item as LayoutItemElement;
	}
	for (const page of pageFrames) {
		const key = page.getAttribute('value');
		const item = key ? items[key] : undefined;
		if (key && item) {
			itemPages.set(item, page as HTMLElement);
		}
	}

	Object.defineProperty(items, 'list', {
		value: Object.values(items)
	});

	this.heads = [
		Scene.head,
		elementDataOf<{ head: HTMLElement }>(Scene.list).head,
		uiEls.get('ui-head'),
		elementDataOf<{ head: HTMLElement }>(uiEls.get('ui-list') ?? {}).head,
		Animation.head,
		elementDataOf<{ head: HTMLElement }>(Animation.list).head,
		elementDataOf<{ head: HTMLElement }>(Animation.timeline).head,
		getBrowserInstance()?.head,
		Palette.head
	];

	File.get!({
		local: 'default.json',
		type: 'json'
	}).then((config: { layout: unknown }) => {
		this.default = config.layout;
	});

	getLayoutStore().focusableSelector = `
  input, textarea, button, .select-box, .check-box, .radio-box,
  .color-box, .custom-box, .common-list, .tree-list, .param-list,
  .command-list, file-body-content, .detail-summary`;

	window.addEventListener('resize', this.windowResize!);
	window.addEventListener('localize', this.windowLocalize!);
	on(this.manager, 'switch', this.pageSwitch!);
	Reflect.set(window, '__yamiLayoutDebug', () => this.logDiagnostics!(true));
};

Layout.switchLayout = function (layout: Record<string, LayoutScheme>) {
	this.layout = layout;
	const { manager } = this;
	for (const page of manager.childNodes) {
		resetPageLayoutState(page as HTMLElement);
	}
	const key = manager.index;
	if (layout[key] !== undefined) {
		this.loadLayoutScheme!(key);
	}
};

Layout.updateGroups = (function IIFE() {
	const update = (group: LayoutGroupElement, split: string, start: number) => {
		if (!group) return start;
		const end = groupData(group).end;
		const style = group.style;
		switch (split) {
			case 'horizontal': {
				const pn = group.parentNode as LayoutGroupElement | null;
				const pw = pn?.clientWidth ?? 0;
				const sl = rasterize(pw * start);
				const sr = rasterize(pw * end);
				style.left = `${sl}px`;
				style.top = '0';
				style.width = `${sr - sl}px`;
				style.height = '100%';
				break;
			}
			case 'vertical': {
				const pn = group.parentNode as LayoutGroupElement | null;
				const ph = pn?.clientHeight ?? 0;
				const st = rasterize(ph * start);
				const sb = rasterize(ph * end);
				style.left = '0';
				style.top = `${st}px`;
				style.width = '100%';
				style.height = `${sb - st}px`;
				break;
			}
			case 'full':
				style.left = '0';
				style.top = '0';
				style.width = '100%';
				style.height = '100%';
				break;
		}
		if (group.split) {
			const split = group.split;
			let start = 0;
			for (const child of group.childNodes) {
				if (hasClass(child, 'group')) {
					start = update(child as LayoutGroupElement, split, start);
				}
			}
		} else {
			const active = (group.manager?.active ?? null) as
				| (HTMLElement & {
						dpr: number;
						width: number;
						height: number;
				  })
				| null;
			const width = group.clientWidth;
			const height = group.clientHeight;
			const dpr = window.devicePixelRatio;
			if (
				active &&
				(active.dpr !== dpr || active.width !== width || active.height !== height)
			) {
				active.dpr = dpr;
				active.width = width;
				active.height = height;
				dispatchResizeEvent(active);
			}
		}
		return end;
	};
	return function (this: typeof Layout, force?: boolean) {
		switch (this.manager?.index) {
			case null:
			case undefined:
			case 'home':
				return;
		}
		const page = this.manager?.active as HTMLElement | null | undefined;
		const root = layoutRootOf(page) as
			| (LayoutGroupElement & { dpr?: number; width?: number; height?: number })
			| null;
		if (!root || !page) return;
		const width = page.clientWidth;
		const height = page.clientHeight;
		const dpr = window.devicePixelRatio;
		if (
			width * height !== 0 &&
			(force || root.dpr !== dpr || root.width !== width || root.height !== height)
		) {
			root.dpr = dpr;
			root.width = width;
			root.height = height;
			update(root, 'full', 0);
			this.logDiagnostics!(false);
		}
	};
})();

Layout.updateGroupTabs = function (group: LayoutGroupElement) {
	const tabs: string[] = [];
	for (const item of group.nav.childNodes) {
		if (item.nodeType !== 1) continue;
		tabs.push((item as HTMLElement).getAttribute('value')!);
	}
	group.tabs = tabs;
	syncLayoutMirror(this.manager?.active as HTMLElement | null | undefined);
};

Layout.updateGroupInfo = function () {
	for (const info of getLayoutStore().resizing.infos) {
		const box = getDevicePixelContentBoxSize(info.manager);
		info.textContent = `${box.width} x ${box.height}`;
	}
};

let diagnosticsLastLogTime = 0;

Layout.logDiagnostics = function (this: typeof Layout, verbose?: boolean) {
	const manager = this.manager as PageManagerApi | null;
	if (manager === null) return;
	const winW = window.innerWidth;
	const winH = window.innerHeight;
	const lines: string[] = [];
	const problems: string[] = [];
	const describe = (el: HTMLElement): string => {
		const r = el.getBoundingClientRect();
		const style = window.getComputedStyle(el);
		return `rect(l:${r.left.toFixed(1)},t:${r.top.toFixed(1)},w:${r.width.toFixed(1)},h:${r.height.toFixed(1)}) position:${style.position} display:${style.display} cssHeight:${style.height}`;
	};
	lines.push(`window:${winW}x${winH} scrollX:${window.scrollX} scrollY:${window.scrollY}`);
	if (window.scrollX !== 0 || window.scrollY !== 0) {
		problems.push(
			`页面发生滚动 scrollX:${window.scrollX} scrollY:${window.scrollY}（顶栏会被滚出视口）`
		);
	}
	lines.push(`#workspace-page-manager: ${describe(manager)} scrollTop:${manager.scrollTop}`);
	const page = manager.active as HTMLElement | null;
	if (page === null) {
		lines.push('active page-frame: null');
	} else {
		lines.push(`active page-frame[value=${page.getAttribute('value')}]: ${describe(page)}`);
		const root = layoutRootOf(page) as LayoutGroupElement | null;
		if (root !== null && hasClass(root, 'group')) {
			const probes: LayoutGeometryProbe[] = [];
			const labelOf = (group: LayoutGroupElement): string => {
				const tabs = group.tabs;
				if (tabs !== undefined && tabs.length !== 0) return tabs.join('|');
				return group.manager !== undefined ? '空组' : `容器(${group.split ?? '-'})`;
			};
			const walk = (group: LayoutGroupElement, depth: number, path: string): void => {
				const indent = ' '.repeat(depth * 2);
				const groupEnd = groupData(group).end;
				const rect = group.getBoundingClientRect();
				probes.push({
					path,
					label: labelOf(group),
					rect: {
						left: rect.left,
						top: rect.top,
						right: rect.right,
						bottom: rect.bottom
					}
				});
				lines.push(
					`${indent}group: ${describe(group)} end:${groupEnd} split:${group.split ?? '-'}`
				);
				const groupManager = group.manager as PageManagerApi | undefined;
				if (groupManager !== undefined) {
					const gmRect = groupManager.getBoundingClientRect();
					lines.push(
						`${indent}  group-manager: ${describe(groupManager)} scrollTop:${groupManager.scrollTop}`
					);
					const visibleValues: string[] = [];
					for (const child of Array.from(groupManager.children)) {
						if (!hasClass(child, 'page-frame')) continue;
						const frame = child as HTMLElement;
						const value = frame.getAttribute('value');
						const visible = hasClass(frame, 'visible');
						if (visible && value !== null) visibleValues.push(value);
						lines.push(
							`${indent}  page-frame[value=${value}] visible:${visible}: ${describe(frame)}`
						);
						if (!visible) continue;
						const style = window.getComputedStyle(frame);
						if (style.position === 'static') {
							problems.push(
								`page-frame[value=${value}] position 为 static（缺少绝对定位样式，高度由内容撑开导致溢出）`
							);
						}
						const fr = frame.getBoundingClientRect();
						if (fr.height > gmRect.height + 1) {
							problems.push(
								`page-frame[value=${value}] 高度 ${fr.height.toFixed(1)} 超出 group-manager 高度 ${gmRect.height.toFixed(1)}`
							);
						}
						if (fr.bottom > winH + 1) {
							problems.push(
								`page-frame[value=${value}] 底部 ${fr.bottom.toFixed(1)} 超出窗口底部 ${winH}（溢出 ${(fr.bottom - winH).toFixed(1)}px）`
							);
						}
					}
					if (visibleValues.length > 1) {
						problems.push(
							`组「${labelOf(group)}」内同时可见 ${visibleValues.length} 个 page-frame（${visibleValues.join(', ')}）⇒ 两页内容完全叠在一起`
						);
					}
				}
				let index = 0;
				for (const child of Array.from(group.children)) {
					if (hasClass(child, 'group')) {
						walk(child as LayoutGroupElement, depth + 1, `${path}/${index}`);
						index++;
					}
				}
			};
			walk(root, 0, '0');
			problems.push(...findGroupOverlaps(probes));
		}
	}
	const browser = storesEls.get('project-browser') as HTMLElement | null;
	if (browser !== null) {
		const br = browser.getBoundingClientRect();
		lines.push(`#project-browser: ${describe(browser)}`);
		const fileBrowser = browser.querySelector('.file-browser') as HTMLElement | null;
		if (fileBrowser !== null) {
			lines.push(`#project-browser 内 .file-browser: ${describe(fileBrowser)}`);
			const fbRect = fileBrowser.getBoundingClientRect();
			if (fbRect.bottom > winH + 1) {
				problems.push(
					`.file-browser 底部 ${fbRect.bottom.toFixed(1)} 超出窗口底部 ${winH}（溢出 ${(fbRect.bottom - winH).toFixed(1)}px）`
				);
			}
		}
		if (br.bottom > winH + 1) {
			problems.push(
				`#project-browser 底部 ${br.bottom.toFixed(1)} 超出窗口底部 ${winH}（溢出 ${(br.bottom - winH).toFixed(1)}px）`
			);
		}
	}
	if (problems.length !== 0 || verbose === true) {
		const now = Date.now();
		if (verbose === true || now - diagnosticsLastLogTime >= 2000) {
			diagnosticsLastLogTime = now;
			/* oxlint-disable no-console */
			console.groupCollapsed(`[LayoutDiagnostics] 发现 ${problems.length} 个问题`);
			for (const line of lines) {
				console.log(line);
			}
			console.groupEnd();
			for (const problem of problems) {
				console.warn(`- ${problem}`);
			}
		}
	}
};

Layout.mergeGroups = (function IIFE() {
	const merge = (outer: LayoutGroupElement) => {
		const nodes = outer.childNodes as NodeListOf<LayoutGroupElement>;
		let i = nodes.length;
		while (--i >= 0) {
			const inner = nodes[i];
			if (inner.split === outer.split) {
				let prev = inner.previousElementSibling as LayoutGroupElement | null;
				while (prev !== null && !hasClass(prev, 'group')) {
					prev = prev.previousElementSibling as LayoutGroupElement | null;
				}
				const gs = prev === null ? 0 : (groupData(prev).end ?? 0);
				const ge = groupData(inner).end;
				const nodes = inner.childNodes as NodeListOf<LayoutGroupElement>;
				while (nodes.length > 1) {
					const node = nodes[0];
					const end = groupData(node).end;
					if (end !== undefined && ge !== undefined) {
						groupData(node).end = roundTo(gs * (1 - end) + ge * end, 6);
					}
					outer.insertBefore(node, inner);
				}
				inner.remove();
			}
		}
		for (const inner of nodes) {
			if (inner.split !== undefined) {
				merge(inner);
			}
		}
	};
	return function (this: typeof Layout) {
		const root = layoutRootOf(this.manager?.active) as LayoutGroupElement | null;
		if (root !== null) merge(root);
	};
})();

Layout.setGroupSize = function (
	group: LayoutGroupElement,
	hint: { width: number; height: number },
	direction: 'forward' | 'backward'
) {
	const parent = group.parentNode as LayoutGroupElement;
	const prev = prevGroupOf(group);
	const next = nextGroupOf(group);
	let space: number | undefined;
	let size: number | undefined;
	switch (parent.split) {
		case 'horizontal':
			space = parent.clientWidth;
			size = group.clientLeft + hint.width;
			break;
		case 'vertical':
			space = parent.clientHeight;
			size = group.clientTop + hint.height;
			break;
	}
	if (space === undefined || size === undefined) return;
	if (next !== null) {
		size += 1;
	}
	if (space !== 0) {
		let end = size / space;
		if (!Number.isFinite(end)) return;
		switch (direction) {
			case 'forward':
				if (prev) {
					end = groupData(prev).end + end;
				}
				if (next === null) {
					end = 1;
				}
				if (!Number.isFinite(end)) return;
				groupData(group).end = roundTo(end, 6);
				this.computeSizesBefore!(group);
				this.computeSizesAfter!(group);
				break;
			case 'backward':
				if (prev) {
					end = groupData(group).end - end;
					if (!Number.isFinite(end)) return;
					groupData(prev).end = roundTo(end, 6);
					this.computeSizesBefore!(prev);
					this.computeSizesAfter!(prev);
				}
				break;
		}
	}
};

Layout.computeSizesBefore = function (group: LayoutGroupElement) {
	const parent = group.parentNode as LayoutGroupElement;
	const space =
		parent.split === 'horizontal'
			? parent.clientWidth
			: parent.split === 'vertical'
				? parent.clientHeight
				: 0;
	if (space !== 0) {
		const groups = groupChildrenOf(parent);
		const index = groups.indexOf(group);
		const run = groups.slice(0, index + 1);
		const head = groups[0];
		const length = run.length;
		const min = Math.min(0.1, 32 / space);
		for (let i = length - 2, end = groupData(group).end; i >= 0; i--) {
			const group = run[i];
			const pad = 2;
			end = Math.min(groupData(group).end, end - min - pad / space);
			end = roundTo(end, 6);
			groupData(group).end = end;
		}
		for (let i = 0, end = 0; i < length; i++) {
			const group = run[i];
			const pad = (group === head ? 0 : 1) + 1;
			end = Math.max(groupData(group).end, end + min + pad / space);
			end = roundTo(end, 6);
			groupData(group).end = end;
		}
	}
};

Layout.computeSizesAfter = function (group: LayoutGroupElement) {
	const parent = group.parentNode as LayoutGroupElement;
	const space =
		parent.split === 'horizontal'
			? parent.clientWidth
			: parent.split === 'vertical'
				? parent.clientHeight
				: 0;
	if (space !== 0) {
		const all = groupChildrenOf(parent);
		const start = all.indexOf(group);
		const groups = start === -1 ? all : all.slice(start);
		const foot = all[all.length - 1];
		const last = groups.length - 1;
		const min = Math.min(0.1, 32 / space);
		for (let i = 0, end = 0; i < last; i++) {
			const group = groups[i];
			const pad = 2;
			end = Math.max(groupData(group).end, end + min + pad / space);
			end = roundTo(end, 6);
			groupData(group).end = end;
		}
		for (let i = last - 1, end = 1; i >= 0; i--) {
			const group = groups[i];
			const pad = (groups[i + 1] === foot ? 0 : 1) + 1;
			end = Math.min(groupData(group).end, end - min - pad / space);
			end = roundTo(end, 6);
			groupData(group).end = end;
		}
	}
};

Layout.updateHint = function (location: LayoutDragLocation | null) {
	const { dragging } = getLayoutStore();
	const { hint } = dragging;
	if (dragging.location) {
		const { trigger } = dragging.location;
		if (hasClass(trigger, 'nav-item')) {
			removeClass(trigger, 'drag-entered');
		}
	}
	if ((dragging.location = location)) {
		const { group } = dragging;
		const { trigger } = location;
		const { target } = location;
		const { direction } = location;
		const gw = group.clientWidth;
		const gh = group.clientHeight;
		const targetRect = rect(target);
		let x = target.clientLeft + targetRect.left;
		let y = target.clientTop + targetRect.top;
		let w = target.clientWidth;
		let h = target.clientHeight;
		switch (direction) {
			case 'inside':
				break;
			case 'top':
				h = Math.min(h / 2 - 1, gh);
				break;
			case 'bottom':
				y = y + h;
				h = Math.min(h / 2 - 1, gh);
				y = y - h;
				break;
			case 'left':
				w = Math.min(w / 2 - 1, gw);
				break;
			case 'right':
				x = x + w;
				w = Math.min(w / 2 - 1, gw);
				x = x - w;
				break;
		}
		if (hasClass(trigger, 'nav-item')) {
			addClass(trigger, 'drag-entered');
		}
		document.body.appendChild(hint);
		hint.set({
			left: x,
			top: y,
			width: w,
			height: h
		});
	} else {
		hint.remove();
	}
};

Layout.getKeyGroups = (function IIFE() {
	const find = (list: LayoutGroupElement[], node: LayoutGroupElement) => {
		if (node.split !== undefined) {
			for (const group of node.childNodes as NodeListOf<LayoutGroupElement>) {
				if (hasClass(group, 'group')) {
					find(list, group);
				}
			}
		} else if (hasClass(node, 'group')) {
			list.push(node);
		}
		return list;
	};
	return function (this: typeof Layout) {
		const root = layoutRootOf(this.manager?.active) as LayoutGroupElement | null;
		return root === null ? [] : find([], root);
	};
})();

Layout.getGroupOfElement = function (element: HTMLElement): LayoutGroupElement | null {
	while ((element = (element ? element.parentNode : null) as HTMLElement)) {
		if (hasClass(element, 'group')) {
			return element as LayoutGroupElement;
		}
	}
	return null;
};

/**
 * 窗口 head 定位（各窗口 updateHead 的公共前置）：
 * - head 可能不在任何组内（窗口关闭/页面未落位）→ 返回 null，调用方直接跳过；
 * - nav 内由 Vue 渲染，末尾可能是**注释/文本锚点**，`lastChild` 未必是元素
 *   （旧实现 `rect(nav.lastChild)` 因此抛 `el.getBoundingClientRect is not a function`）。
 */
export const headNavOf = (head: HTMLElement | null | undefined): HTMLElement | null => {
	if (!head) return null;
	const group = Layout.getGroupOfElement!(head);
	const nav = group?.nav as HTMLElement | undefined;
	return nav instanceof HTMLElement ? nav : null;
};

export const lastNavItemOf = (nav: HTMLElement | null | undefined): HTMLElement | null => {
	if (!nav) return null;
	const last = nav.lastElementChild;
	return last instanceof HTMLElement ? last : null;
};

Layout.readyToFocus = function (element: HTMLElement) {
	const group = this.getGroupOfElement!(element);
	if (group) {
		addClass(group, 'ready-to-focus');
		setTimeout(() => {
			removeClass(group, 'ready-to-focus');
			(element as HTMLElement & { focus(options?: FocusOptions): void }).focus({
				preventScroll: true
			});
		});
	}
};

Layout.enableFocusableElements = function () {
	const store = getLayoutStore();
	const elements = store.focusableElements;
	if (elements) {
		for (const element of elements) {
			if (element.clientWidth !== 0) {
				element.tabIndex += 1;
			}
		}
		store.focusableElements = null;
	}
};

Layout.disableFocusableElements = function () {
	if (!this.manager) return;
	const { active } = this.manager;
	if (active) {
		const nodes: HTMLElement[] = [];
		const selector = getLayoutStore().focusableSelector;
		const elements = active.querySelectorAll(selector);
		for (const element of elements) {
			if (element.clientWidth !== 0) {
				element.tabIndex -= 1;
				nodes.push(element);
			}
		}
		getLayoutStore().focusableElements = nodes;
	}
};

Layout.saveNavStates = function () {
	for (const item of this.items!.list) {
		if (hasClass(item, 'selected')) {
			const nav = item.parentNode as HTMLElement;
			navLastValues.set(nav, item.getAttribute('value'));
			write(nav, null);
		}
	}
};

Layout.saveLayoutScheme = function (rootGroup: LayoutGroupElement) {
	return toLayoutScheme(deserializeGroupElement(rootGroup));
};

Layout.loadLayoutScheme = function (key?: string) {
	const layout = this.layout ?? {};
	let scheme = layout[key ?? ''];
	if (scheme === undefined) {
		scheme = this.default?.[key ?? ''];
	}
	const page = this.manager.active;
	if (scheme === undefined || page === null) {
		return;
	}
	const isFirst = pageSchemes.get(page) !== scheme;
	if (isFirst) {
		pageSchemes.set(page, scheme);
	}
	const pending = this.loadLayoutSchemeVueTeleport!(key ?? '', scheme, page, isFirst);
	pending.catch((error: unknown) => {
		console.warn('[loadLayoutScheme(teleport)] failed:', error);
	});
	lastVueSchemeLoad = pending;
};

Layout.loadLayoutSchemeVueTeleport = async function (
	_key: string,
	scheme: LayoutScheme,
	page: HTMLElement,
	isFirst: boolean
) {
	const previous = lastVueSchemeLoad;
	if (previous !== null) {
		await previous.catch(() => {});
	}
	if (isFirst) {
		const prior = vueTreeHandles.get(page);
		if (prior !== undefined) {
			const values = hostedValues(prior.root);
			if (values.length !== 0) {
				getLayoutStore().removePageTargets(values);
				getLayoutStore().removeTabTargets(values);
				getLayoutStore().pruneDetachedTargets?.();
				await nextTick();
			}
			prior.unmount();
			vueTreeHandles.delete(page);
		}
		const handle = await mountVueGroupTree(page, scheme as LayoutSchemeData, {
			navWrite: this.navWrite!,
			navPointerdown: this.navPointerdown!,
			navDragstart: this.navDragstart!,
			navDragend: this.navDragend!,
			borderPointerdown: this.borderPointerdown!
		});
		vueTreeHandles.set(page, handle);
	} else if (vueTreeHandles.get(page) === undefined && layoutRootOf(page) === null) {
		return this.loadLayoutSchemeVueTeleport!(_key, scheme, page, true);
	}

	const leaves = publishLeafTargets(layoutRootOf(page));
	await nextTick();
	for (const leaf of leaves) {
		orderLeafHostChildren(leaf);
		if (isFirst) {
			activateLeafTab(leaf, leaf.tabs?.[0]);
		} else {
			activateLeafTab(
				leaf,
				(leaf.nav === undefined ? null : navLastValues.get(leaf.nav)) ?? leaf.tabs?.[0]
			);
		}
	}
	this.updateGroups!();
	syncLayoutMirror(page);
	syncPageTargets(this.manager);
};

/**
 * 用**给定的** scheme 重挂载整棵 Vue 组树（`rebuildVueLayoutFromDom` 与 region drop 共用）。
 *
 * ⚠️ 调用方已经把 scheme 写进 `layout[key]`；本函数只管「收回旧归属 → 卸载 → 清组 DOM → 挂新树 →
 * 发布归属 → 排序/写首签 → 激活」这一串，**不再从 DOM 反读**。串行化用 `lastVueSchemeLoad`，
 * 因此调用方必须自己 `await`/登记（`rebuildVueLayoutFromDom` 就是被登记的那个）。
 */
async function mountSchemeIntoPage(
	page: HTMLElement,
	scheme: LayoutScheme,
	activateTab: string | undefined
): Promise<void> {
	const prior = vueTreeHandles.get(page);
	if (prior !== undefined) {
		const values = new Set<string>();
		for (const value of hostedValues(layoutRootOf(page))) values.add(value);
		for (const value of hostedValues(prior.root)) values.add(value);
		if (values.size !== 0) {
			const list = Array.from(values);
			getLayoutStore().removePageTargets(list);
			getLayoutStore().removeTabTargets(list);
			getLayoutStore().pruneDetachedTargets?.();
			await nextTick();
		}
		prior.unmount();
		vueTreeHandles.delete(page);
	}
	for (const child of Array.from(page.children)) {
		if (hasClass(child, 'group')) child.remove();
	}

	const handle = await mountVueGroupTree(page, scheme as LayoutSchemeData, {
		navWrite: Layout.navWrite!,
		navPointerdown: Layout.navPointerdown!,
		navDragstart: Layout.navDragstart!,
		navDragend: Layout.navDragend!,
		borderPointerdown: Layout.borderPointerdown!
	});
	vueTreeHandles.set(page, handle);

	const leaves = publishLeafTargets(handle.root);
	await nextTick();
	for (const leaf of leaves) {
		orderLeafHostChildren(leaf);
		activateLeafTab(leaf, leaf.tabs?.[0]);
	}
	Layout.updateGroups!();
	syncLayoutMirror(page);
	syncPageTargets(Layout.manager);

	if (activateTab !== undefined) {
		for (const leaf of leaves) {
			if ((leaf.tabs ?? []).includes(activateTab)) {
				activateLeafTab(leaf, activateTab);
				break;
			}
		}
	}
}

Layout.rebuildVueLayoutFromDom = async function (
	key?: string,
	activateTab?: string
): Promise<void> {
	const target = this.manager?.active as
		| (HTMLElement & { scheme?: LayoutScheme })
		| null
		| undefined;
	if (!target || vueTreeHandles.get(target) === undefined) return;
	const previous = lastVueSchemeLoad;
	if (previous !== null) {
		await previous.catch(() => {});
	}
	const page = this.manager?.active as
		| (HTMLElement & { scheme?: LayoutScheme })
		| null
		| undefined;
	if (!page) return;
	const root = layoutRootOf(page) as LayoutGroupElement | null;
	if (!root || !hasClass(root, 'group')) return;

	const layoutKey = key ?? page.getAttribute('value') ?? this.manager?.index ?? '';
	const scheme = toLayoutScheme(
		collapseRedundantSplits(parseLayoutScheme(this.saveLayoutScheme!(root) as LayoutSchemeData))
	);
	const layout = (this.layout ??= {} as Record<string, LayoutScheme>);
	layout[layoutKey] = scheme;
	pageSchemes.set(page, scheme);

	await mountSchemeIntoPage(page, scheme, activateTab);
};

Layout.saveToConfig = function (config: { layout?: Record<string, LayoutScheme> | null }) {
	const { layout } = this;
	for (const page of this.manager.childNodes) {
		const key = page.getAttribute('value');
		if (pageSchemes.get(page as HTMLElement) === layout![key]) {
			const mirrored = pageTrees.get(page as HTMLElement);
			const scheme =
				mirrored ??
				(layoutRootOf(page) !== null ? this.saveLayoutScheme!(layoutRootOf(page)!) : null);
			if (scheme !== null && hasAnyTabs(scheme)) layout![key] = scheme;
		}
	}
	config.layout = layout;
};

Layout.loadFromConfig = function (config: { layout?: Record<string, LayoutScheme> | null }) {
	this.layout = config.layout ?? {};
};

Layout.windowResize = function (_event: EditorEvent) {
	Layout.updateGroups!();
};

Layout.windowLocalize = function (_event: EditorEvent) {
	if (Layout.manager.active !== null) {
		for (const group of Layout.getKeyGroups!()) {
			dispatchResizeEvent(group.manager.active);
		}
	}
};

Layout.pageSwitch = function (event: YamiEvent) {
	try {
		switch (event.last) {
			case 'scene':
				Scene.save!();
				Scene.close!();
				break;
			case 'ui':
				getUIStore().save();
				getUIStore().close();
				break;
			case 'animation':
				Animation.save();
				Animation.close();
				break;
			case 'particle':
				Particle.save!();
				Particle.close!();
				break;
		}
	} catch (error) {
		console.warn('[pageSwitch] close previous page failed:', error);
	}

	try {
		switch (event.last) {
			case 'directory':
			case 'scene':
			case 'ui':
			case 'animation':
			case 'particle':
				Layout.saveNavStates!();
				break;
		}
	} catch (error) {
		console.warn('[pageSwitch] saveNavStates failed:', error);
	}

	switch (event.value) {
		case 'scene': {
			const body = Scene.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		case 'ui': {
			const body = uiEls.get('ui-body')!;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		case 'animation': {
			const body = Animation.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		case 'particle': {
			const body = Particle.body;
			const target = body.firstChild;
			body.insertBefore(GL.canvas, target);
			break;
		}
		default:
			GL.canvas.remove();
			break;
	}

	try {
		switch (event.value) {
			case 'home':
				removeClass(Title.tabBar, 'visible');
				Home.updateCenterPosition!();
				Home.parseRecentProjects!();
				break;
			case 'directory':
				if (Title.tabBar) {
					addClass(Title.tabBar, 'visible');
					Title.tabBar.select(Title.tabBar.dirItem);
				}
				Layout.loadLayoutScheme!('directory');
				break;
			case 'scene':
				addClass(Title.tabBar, 'visible');
				Layout.loadLayoutScheme!('scene');
				break;
			case 'ui':
				addClass(Title.tabBar, 'visible');
				Layout.loadLayoutScheme!('ui');
				break;
			case 'animation':
				addClass(Title.tabBar, 'visible');
				Layout.loadLayoutScheme!('animation');
				break;
			case 'particle':
				addClass(Title.tabBar, 'visible');
				Layout.loadLayoutScheme!('particle');
				break;
			default:
				removeClass(Title.tabBar, 'visible');
				break;
		}
	} catch (error) {
		console.warn('[pageSwitch] loadLayoutScheme failed:', error);
	}
};

Layout.navWrite = function (this: typeof Layout, event: YamiEvent) {
	const index = event.value;
	(this as typeof Layout).parentNode.manager.switch(index);
	Layout.updateGroups!();
	if (typeof requestAnimationFrame === 'function') {
		requestAnimationFrame(() => Layout.updateGroups!());
	}
};

Layout.activateLayoutPage = function (
	this: typeof Layout,
	page: HTMLElement | null | undefined
): boolean {
	const value = page?.getAttribute('value') ?? '';
	if (value === '') return false;
	const apply = (): boolean => {
		if (!page?.isConnected) return false;
		const group = this.getGroupOfElement?.(page);
		const nav = group?.nav as HTMLElement | undefined;
		if (!nav) return false;
		if ((group as LayoutGroupElement).manager?.index === value) return true;
		write(nav, value);
		return true;
	};
	const pending = lastVueSchemeLoad;
	const applied = apply();
	if (pending !== null) {
		void pending
			.catch(() => {})
			.then(() => {
				apply();
			});
	}
	return applied;
};

Layout.navPointerdown = function (event: { button: number; target: LayoutItemElement }) {
	switch (event.button) {
		case 0: {
			const element = event.target;
			if (hasClass(element, 'nav-item') && hasClass(element, 'selected')) {
				switch (element.getAttribute('value')) {
					case 'inspector':
						Layout.readyToFocus!(Inspector.manager);
						break;
					default: {
						const page = itemPages.get(element);
						if (!page) break;
						const nodes = page.querySelectorAll(
							'[tabindex]'
						) as NodeListOf<HTMLElement>;
						for (let i = nodes.length - 1; i >= 0; i--) {
							const node = nodes[i];
							if (node.clientWidth !== 0 && node.clientHeight !== 0) {
								Layout.readyToFocus!(node);
								break;
							}
						}
						Layout.readyToFocus!(page);
						break;
					}
				}
			}
			break;
		}
	}
};

Layout.navDragstart = function (this: typeof Layout, event: LayoutDragEvent) {
	if (!getLayoutStore().dragging) {
		getLayoutStore().dragging = event;
		Object.defineProperty(event, 'clientX', { writable: true });
		Object.defineProperty(event, 'clientY', { writable: true });
		event.preventDefault = fnEmpty;
		hideDragImage(event.dataTransfer!);
		event.group = (this as HTMLElement & typeof Layout).parentNode as HTMLElement | null;
		event.hint = createDragAndDropHint();
		addClass(event.hint, 'for-group');
		window.addEventListener('dragenter', Layout.navDragover!);
		window.addEventListener('dragover', Layout.navDragover!);
		const groups = Layout.getKeyGroups!();
		const navs: HTMLElement[] = (event.navs = []);
		const regions: HTMLElement[] = (event.regions = []);
		for (const group of groups) {
			const nav = group.nav;
			on(nav, 'dragenter', Layout.navDragenter!);
			on(nav, 'dragleave', Layout.navDragleave!);
			on(nav, 'drop', Layout.navDrop!);
			navs.push(nav);
			const region = renderElement(h('group-region', { class: 'group-region' }));
			on(region, 'dragleave', Layout.regionDragleave!);
			on(region, 'dragover', Layout.regionDragover!);
			on(region, 'drop', Layout.navDrop!);
			group.appendChild(region);
			regions.push(region);
		}
		for (const head of Layout.heads ?? []) {
			if (head instanceof HTMLElement) head.style.pointerEvents = 'none';
		}
	}
};

Layout.navDragend = function (_event: EditorEvent) {
	const { dragging } = getLayoutStore();
	if (dragging) {
		window.removeEventListener('dragenter', Layout.navDragover!);
		window.removeEventListener('dragover', Layout.navDragover!);
		for (const nav of dragging.navs) {
			off(nav, 'dragenter', Layout.navDragenter!);
			off(nav, 'dragleave', Layout.navDragleave!);
			off(nav, 'drop', Layout.navDrop!);
		}
		for (const region of dragging.regions) {
			off(region, 'dragleave', Layout.regionDragleave!);
			off(region, 'dragover', Layout.regionDragover!);
			off(region, 'drop', Layout.navDrop!);
			region.remove();
		}
		for (const head of Layout.heads ?? []) {
			if (head instanceof HTMLElement) head.style.pointerEvents = '';
		}
		Layout.updateHint!(null);
		getLayoutStore().dragging = null;
	}
};

Layout.navDragenter = function (this: typeof Layout, event: DragEvent) {
	const { dragging } = getLayoutStore();
	if (dragging) {
		event.preventDefault();
		event.dataTransfer!.dropEffect = 'move';
		const trigger = event.target;
		const target = (this as HTMLElement & typeof Layout).parentNode as HTMLElement;
		const sGroup = dragging.group;
		const sItem = dragging.target;
		const sNav = sGroup.nav;
		const sItems = Array.from(sNav.children).filter((child) => hasClass(child, 'nav-item'));
		if (
			target !== sGroup ||
			(sItems.length > 1 &&
				trigger !== sItem &&
				!(trigger === sNav && sItem === sNav.lastChild) &&
				trigger !== sItem.nextSibling)
		) {
			Layout.updateHint!({
				trigger: trigger,
				target: target,
				direction: 'inside'
			});
		} else {
			Layout.updateHint!(null);
		}
	}
};

Layout.navDragleave = function (event: EditorEvent) {
	const { dragging } = getLayoutStore();
	if (dragging && dragging.location && dragging.location.trigger === event.target) {
		Layout.updateHint!(null);
	}
};

Layout.navDragover = function (event: DragEvent) {
	event.preventDefault();
	event.dataTransfer!.dropEffect = 'move';
};

Layout.navDrop = function (event: EditorEvent) {
	const { dragging } = getLayoutStore();
	if (!dragging) {
		return;
	}
	event.stopPropagation();
	let draggedValue: string | undefined;
	if (dragging.location) {
		const sGroup = dragging.group;
		const item = dragging.target;
		draggedValue = item.getAttribute?.('value') ?? undefined;
		const { hint } = dragging;
		const { location } = dragging;
		const { trigger } = location;
		const { target } = location;
		const { direction } = location;

		if (direction === 'inside' && target === sGroup) {
			applyTabDropWithin(sGroup, item, trigger);
			syncLayoutMirror(Layout.manager?.active);
			syncPageTargets(Layout.manager);
			return;
		}

		const pending = applyStructuralDrop({
			sGroup,
			target: target as LayoutGroupElement,
			direction,
			tab: draggedValue,
			trigger,
			hint
		});
		if (pending !== null) {
			lastVueSchemeLoad = pending;
			pending.catch((error: unknown) => {
				console.warn('[navDrop(structural)] failed:', error);
			});
		}
	}
	syncLayoutMirror(Layout.manager?.active);
	syncPageTargets(Layout.manager);
};

Layout.regionDragleave = function (this: typeof Layout, _event: EditorEvent) {
	const { dragging } = getLayoutStore();
	if (dragging && dragging.location && dragging.location.trigger === this) {
		Layout.updateHint!(null);
	}
};

Layout.regionDragover = function (this: typeof Layout, event: DragEvent) {
	const { dragging } = getLayoutStore();
	if ((dragging && dragging.clientX !== event.clientX) || dragging.clientY !== event.clientY) {
		dragging.clientX = event.clientX;
		dragging.clientY = event.clientY;
		const root = layoutRootOf(Layout.manager?.active) as LayoutGroupElement | null;
		let target: HTMLElement = (this as HTMLElement & typeof Layout).parentNode as HTMLElement;
		let parent: HTMLElement = target.parentNode as HTMLElement;
		let siblings = parent.childNodes;
		let direction;
		if (root && root.split) {
			const { x, y } = getRelativeCoords(event, root);
			const w = root.clientWidth;
			const h = root.clientHeight;
			const nodes = Array.from(root.children) as HTMLElement[];
			const padding = 8;
			if (!direction && y < padding + 20) {
				direction = 'top';
				if (root.split === 'horizontal') {
					target = root;
				}
				if (root.split === 'vertical') {
					target = nodes[0];
				}
			}
			if (!direction && y > h - padding) {
				direction = 'bottom';
				if (root.split === 'horizontal') {
					target = root;
				}
				if (root.split === 'vertical') {
					target = nodes[nodes.length - 2];
				}
			}
			if (!direction && x < padding) {
				direction = 'left';
				if (root.split === 'horizontal') {
					target = nodes[0];
				}
				if (root.split === 'vertical') {
					target = root;
				}
			}
			if (!direction && x > w - padding) {
				direction = 'right';
				if (root.split === 'horizontal') {
					target = nodes[nodes.length - 2];
				}
				if (root.split === 'vertical') {
					target = root;
				}
			}
		}
		const { x, y } = getRelativeCoords(event, this);
		const w = (this as HTMLElement & typeof Layout).clientWidth;
		const h = (this as HTMLElement & typeof Layout).clientHeight;
		const n = Math.min(w, h) / 4;
		const l = n;
		const t = n;
		const r = w - n;
		const b = h - n;
		const padding = n / 3;
		if (!direction && x >= l && x < r && y >= t && y < b) {
			direction = 'center';
		}
		if (!direction && y < t) {
			const tan1 = Math.atan2(y, x);
			const tan2 = Math.atan2(y, x - w);
			if (tan1 < Math.PI * 0.25 && tan2 > Math.PI * 0.75) {
				direction = 'top';
				if (y < padding) {
					if ((parent as LayoutGroupElement).split === 'horizontal') {
						target = parent;
					}
					if (
						(parent as LayoutGroupElement).split === 'vertical' &&
						target === siblings[0]
					) {
						const outer = parent.parentNode as HTMLElement | null;
						if (outer !== null && hasClass(outer, 'group')) {
							target = outer;
						}
					}
				}
			}
		}
		if (!direction && y >= b) {
			const tan1 = Math.atan2(y - h, x);
			const tan2 = Math.atan2(y - h, x - w);
			if (tan1 > -Math.PI * 0.25 && tan2 < -Math.PI * 0.75) {
				direction = 'bottom';
				if (y >= h - padding) {
					if ((parent as LayoutGroupElement).split === 'horizontal') {
						target = parent;
					}
					if (
						(parent as LayoutGroupElement).split === 'vertical' &&
						target === siblings[siblings.length - 2]
					) {
						const outer = parent.parentNode as HTMLElement | null;
						if (outer !== null && hasClass(outer, 'group')) {
							target = outer;
						}
					}
				}
			}
		}
		if (!direction && x < l) {
			direction = 'left';
			if (x < padding) {
				if (
					(parent as LayoutGroupElement).split === 'horizontal' &&
					target === siblings[0]
				) {
					const outer = parent.parentNode as HTMLElement | null;
					if (outer !== null && hasClass(outer, 'group')) {
						target = outer;
					}
				}
				if ((parent as LayoutGroupElement).split === 'vertical') {
					target = parent;
				}
			}
		}
		if (!direction && x >= r) {
			direction = 'right';
			if (x >= w - padding) {
				if (
					(parent as LayoutGroupElement).split === 'horizontal' &&
					target === siblings[siblings.length - 2]
				) {
					const outer = parent.parentNode as HTMLElement | null;
					if (outer !== null && hasClass(outer, 'group')) {
						target = outer;
					}
				}
				if ((parent as LayoutGroupElement).split === 'vertical') {
					target = parent;
				}
			}
		}
		switch (direction) {
			case 'left':
			case 'top':
			case 'right':
			case 'bottom': {
				const sGroup = dragging.group;
				const sItems = Array.from(sGroup.nav.children).filter((child) =>
					hasClass(child, 'nav-item')
				);
				const split = (target.parentNode as LayoutGroupElement).split;
				const prev = target.previousSibling;
				const next = target.nextSibling;
				if (
					sItems.length > 1 ||
					(target !== sGroup &&
						((direction === 'left' && !(split === 'horizontal' && prev === sGroup)) ||
							(direction === 'top' && !(split === 'vertical' && prev === sGroup)) ||
							(direction === 'right' &&
								!(split === 'horizontal' && next === sGroup)) ||
							(direction === 'bottom' && !(split === 'vertical' && next === sGroup))))
				) {
					if (
						!dragging.location ||
						dragging.location.trigger !== this ||
						dragging.location.target !== target ||
						dragging.location.direction !== direction
					) {
						Layout.updateHint!({
							trigger: this,
							target: target,
							direction: direction
						});
					}
					break;
				}
			}
			case 'center':
			default:
				if (dragging.location) {
					Layout.updateHint!(null);
				}
				break;
		}
	}
};

Layout.borderPointerdown = function (
	this: typeof Layout,
	event: YamiMouseEvent & LayoutResizeEvent
) {
	switch (event.button) {
		case 0:
			if (!getLayoutStore().resizing) {
				getLayoutStore().resizing = event;
				const group = (this as HTMLElement & typeof Layout)
					.parentNode as LayoutGroupElement;
				const outer = group.parentNode as LayoutGroupElement;
				switch (outer.split) {
					case 'horizontal':
						event.mode = 'col-resize';
						event.startX = Math.round(outer.clientWidth * groupData(group).end);
						Cursor.open('cursor-col-resize');
						break;
					case 'vertical':
						event.mode = 'row-resize';
						event.startY = Math.round(outer.clientHeight * groupData(group).end);
						Cursor.open('cursor-row-resize');
						break;
				}
				event.outer = outer;
				event.group = group;
				event.end = groupData(group).end;
				window.addEventListener('pointerup', Layout.pointerup!);
				window.addEventListener('pointermove', Layout.pointermove!);
				const groups = Layout.getKeyGroups!();
				const infos: HTMLElement[] = (event.infos = []);
				for (const group of groups) {
					const info = renderElement(h('group-info', { class: 'group-info' }));
					(info as HTMLElement & { manager: PageManagerApi }).manager = group.manager;
					group.appendChild(info);
					infos.push(info);
				}
				Layout.updateGroupInfo!();
			}
			break;
	}
};

Layout.pointerup = function (event?: EditorEvent) {
	const { resizing } = getLayoutStore();
	if (resizing === null) {
		return;
	}
	if (event === undefined) {
		event = resizing;
	}
	if (relate(resizing, event)) {
		switch (resizing.mode) {
			case 'col-resize':
				Cursor.close('cursor-col-resize');
				break;
			case 'row-resize':
				Cursor.close('cursor-row-resize');
				break;
		}
		for (const info of resizing.infos) {
			info.remove();
		}
		getLayoutStore().resizing = null;
		syncLayoutMirror(this.manager?.active as HTMLElement | null | undefined);
		window.removeEventListener('pointerup', Layout.pointerup!);
		window.removeEventListener('pointermove', Layout.pointermove!);
	}
};

Layout.pointermove = function (event: YamiMouseEvent) {
	let end: number | undefined = undefined;
	const { resizing } = getLayoutStore();
	switch (resizing.mode) {
		case 'col-resize':
			end =
				+(event.clientX + resizing.startX - resizing.clientX) / resizing.outer.clientWidth;
			break;
		case 'row-resize':
			end =
				+(event.clientY + resizing.startY - resizing.clientY) / resizing.outer.clientHeight;
			break;
	}
	end = clamp(end!, 0, 1);
	end = roundTo(end!, 6);
	if (end !== undefined) {
		const { group } = resizing;
		const lastEnd = groupData(group).end;
		if (lastEnd !== end) {
			groupData(group).end = end;
			if (end > lastEnd) {
				Layout.computeSizesAfter!(group);
			} else {
				Layout.computeSizesBefore!(group);
			}
			Layout.updateGroups!(true);
			Layout.updateGroupInfo!();
		}
	}
};

const layoutBridgeKeys = [
	'dragging',
	'resizing',
	'focusableSelector',
	'focusableElements'
] as const;
import { getLayoutStore } from '@app/stores/layout';
import type { YamiElement } from '@app/types/element-api';
import type { EditorEvent, YamiEvent, YamiMouseEvent } from '@app/types/editor-event';
import { clamp, roundTo } from '@app/utils/math';
import { empty as fnEmpty } from '@app/utils/function';
import { rasterize, getDevicePixelContentBoxSize } from '@app/utils/css';

for (const key of layoutBridgeKeys) {
	Object.defineProperty(Layout, key, {
		get: () => getLayoutStore()[key],
		set: (value: unknown) => {
			Reflect.set(getLayoutStore(), key, value);
		},
		configurable: true
	});
}
