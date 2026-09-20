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
	createNavBarElement as createNavBar,
	createPageManagerElement as createPageManager,
	type PageManagerApi
} from '@ui-kit';
import {
	toLayoutScheme,
	moveTabWithin,
	parseLayoutScheme,
	collapseRedundantSplits,
	type LayoutSchemeData
} from './layout-scheme';
import { deserializeGroupElement } from './layout-deserialize';
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

// M5-b（layout 迁移规划 M5）：双路开关与命令式装载路径已退场——
// 组树一律由 LayoutTreeView(.vue) 渲染并水合，页/页签一律经整壳 Teleport 落位。
// 每个宿主 page 上挂载中的 Vue 组树（再次首载/切布局时先收回页签再 unmount）
const vueTreeHandles = new WeakMap<HTMLElement, VueGroupTreeHandle>();
// 最近一次 Vue 渲染加载（供 loadLayoutScheme fire-and-forget 后测试/时序方等待）
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

// P4b：`end`（组的分数结束位置）是元素数据——原型访问器即将退役，这里给出显式视图
// （写法同 ui-kit 的 tree-api.ts）。manager 上的 `active` **不走元素数据**：Vue 版
// YMPageManager 在元素上 `Object.defineProperty(el, 'active', …)` 自建访问器（遮蔽原型），
// 命令式 createPageManagerElement 走原型访问器——两种实现并存，故 `manager.active` 保持原样。
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

// P1b：这条「离屏创建」此前在本仓有**三份**实现（utils/dom 的 renderDetached、element-utils 的 renderElement、
// 这里）——统一委托给 utils/dom 的唯一缝隙（它的语义正是"返回已脱离宿主的节点"）。
function renderElement(vnode: VNode): HTMLElement {
	return renderDetached(vnode);
}

// M4-2：组根发现。宿主页内可能残留 palette 空壳（#layout-content 盒子，teleport 模式下
// LayoutPaletteHost 只搬 NavBar/PageManager）等非组元素，按 class 找组根才是稳定的；
// 命令式模式（首元素即组根）下行为不变，找不到组时回退首个元素保持旧语义。
const layoutRootOf = (page: Element | null | undefined): HTMLElement | null => {
	if (!page) return null;
	const element = page as Element & { childNodes?: ArrayLike<ChildNode> };
	const children: ArrayLike<Element> =
		element.children ?? (element.childNodes as unknown as ArrayLike<Element>) ?? [];
	const list = Array.from(children).filter((child) => child?.nodeType === 1);
	for (const child of list) {
		if (hasClass(child, 'group')) return child as HTMLElement;
	}
	return (list[0] as HTMLElement | undefined) ?? null;
};

// M4-2：退化 scheme 判定（无任何页签）。挂载失败/半挂载时会序列化出空树，
// 若用它覆盖 config.layout 会丢用户布局，故 saveToConfig 只接受含页签的 scheme。
const hasAnyTabs = (node: LayoutScheme | null | undefined): boolean => {
	if (!node) return false;
	if (Array.isArray(node.tabs) && node.tabs.length !== 0) return true;
	return (node.children ?? []).some((child) => hasAnyTabs(child));
};

// 组容器的兄弟遍历必须是「组元素」序列：Vue 组树会在容器内留注释/文本锚点，
// 按 childNodes/previousSibling 取会拿到锚点（end 为 undefined → 比例算成 NaN →
// 序列化兜底成 1 → 兄弟重叠、边界线不可拖拽缩放）。见 layout 迁移规划 修复记录。
const groupChildrenOf = (parent: Element): LayoutGroupElement[] =>
	Array.from(parent.children).filter((child) => hasClass(child, 'group')) as LayoutGroupElement[];

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

// M5-a（layout 迁移规划 M5）：以引擎内部状态取代 DOM expando 读法。
// page.scheme → pageSchemes（幂等判据）、nav.lastValue → navLastValues（会话恢复）、
// item.page → itemPages（页签↔页配对）；pageTrees 为运行时布局镜像（收敛点刷新），
// saveToConfig 由「每次读 DOM」改为读镜像。
const pageSchemes = new WeakMap<HTMLElement, LayoutScheme>();
const pageTrees = new WeakMap<HTMLElement, LayoutScheme>();
const navLastValues = new WeakMap<HTMLElement, string | null>();
const itemPages = new WeakMap<HTMLElement, HTMLElement>();

export const getPageScheme = (page: HTMLElement): LayoutScheme | undefined => pageSchemes.get(page);

export const resetPageLayoutState = (page: HTMLElement): void => {
	pageSchemes.delete(page);
	pageTrees.delete(page);
};

// 仅清镜像（保留「已物化」判据），用于验证退化 DOM 不写回的兜底路径
export const clearLayoutMirror = (page: HTMLElement): void => {
	pageTrees.delete(page);
};

export const getNavLastValue = (nav: HTMLElement): string | null => navLastValues.get(nav) ?? null;

export const setNavLastValue = (nav: HTMLElement, value: string | null): void => {
	navLastValues.set(nav, value);
};

// 登记「页签 ↔ 页」配对（Layout.initialize 生产路径调用；测试 fixture 亦用）
export const setItemPage = (item: HTMLElement, page: HTMLElement): void => {
	itemPages.set(item, page);
};

// 归属表/镜像刷新（生产路径在收敛点自动调用；测试 fixture 手工落位后调用）
export const refreshLayoutTargets = (): void => {
	syncLayoutMirror(Layout.manager?.active as HTMLElement | null | undefined);
	syncPageTargets(Layout.manager);
};

// M5-c：palette 显式登记（LayoutPanel 拥有 palette 节点，装载前一次性登记，
// 取代「按 DOM 形态猜测 palette 位置」的双形态发现；DOM 发现降级为缺失项兜底）。
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

// 收敛点后用当前 DOM 刷新运行时镜像（结构 + end/dp 比例的单一数据副本）
const syncLayoutMirror = (page: HTMLElement | null | undefined): void => {
	if (!page) return;
	const root = layoutRootOf(page);
	if (root === null) {
		pageTrees.delete(page);
		return;
	}
	pageTrees.set(page, toLayoutScheme(deserializeGroupElement(root)));
};

// 结构/归属收敛点后把「value → 归属 manager」刷进 layout store，供 Vue 层 Teleport :to 使用。
const syncPageTargets = (
	manager: {
		active: Element | null;
	} | null
): void => {
	if (manager === null) return;
	const root = layoutRootOf(manager.active);
	getLayoutStore().setPageTargets(collectPageTargets(root));
};

// ---- M3b-2b Teleport 模式辅助（layout 迁移规划 附录 F）----
// 水合后叶子 group 带 tabs/nav/manager/border expando；按 DOM 收集某组树内全部叶子宿主。

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

// Teleport 落位后按 group.tabs 顺序收敛每个叶子 nav/manager 的子节点序
// （Teleport 到达序 = palette 声明序，可能与 tabs 序不同，见附录 F.2）。
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

// M4（layout 迁移规划 M4）：同组 drop（inside）生效动作数据化。
// 由 group.tabs 数据 + moveTabWithin 直接推导目标顺序，再按 tabs 序收敛 nav/manager
// 子节点序（复用附录 F.2 的「排序 pass」语义），取代命令式 insertBefore/appendChild 差量；
// 对 Vue/Teleport 管理的子节点也安全（pass 只做容器内稳定追加，探针 B 已证）。
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

// 把当前宿主 page 内挂载的 Vue 组树叶子归属发布到 store（页 → manager、页签 → nav）。
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
	createGroupContent: null as ((group: LayoutGroupElement) => void) | null,
	createGroupBorder: null as ((group: LayoutGroupElement) => void) | null,
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
	// M5-c：palette 显式登记优先（LayoutPanel 拥有 palette 节点，装载前全量登记）。
	// P1b：登记缺失时的兜底改为**在 palette 容器子树内**查找——原先用
	// `document.querySelectorAll('.nav-item[value]')` / `('.page-frame[value]')` 全文档扫，
	// 而条目本来就在这两个容器里；子树查询保留了「不因登记不完整而丢项」的韧性
	// （用例 `layout-item-registry.spec.ts` 的「兜底合并」守着它），又不越出组件自身范围。
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
			// M5-a：页签↔页配对存引擎内部（原为 items[key].page expando）
			itemPages.set(item, page as HTMLElement);
		}
	}

	Object.defineProperty(items, 'list', {
		value: Object.values(items)
	});

	this.heads = [
		Scene.head,
		elementDataOf<{ head: HTMLElement }>(Scene.list).head,
		// ⚠️ 这里**不能**用 `getUIStore().head` / `.list`（2026-09-18 实测崩溃点）。
		//
		// `Layout.initialize` 由 `initCore` 调用，而 `initCore` 在 `Editor.initialize` 里跑得
		// **早于** `UI.initialize()`——后者唯一的调用方是 `LayoutPanel.vue` 的 `onMounted`
		// 里 `nextTick(() => getUIStore().initialize())`，即「LayoutPanel 挂载后的下一个 tick」。
		// 于是在这个时刻注册表里的 `ui-list` / `ui-head` 还没登记，`getUIStore().head`
		// 会是 `undefined`，而 `elementDataOf(undefined)` 会抛
		// `TypeError: Invalid value used as weak map key`
		// —— 启动即挂：`[init] Layout stack: TypeError: Invalid value used as weak map key`。
		//
		// 而遗留的 `UI.head` / `UI.list` 是 `ui-window.ts` 在**模块加载期**就赋好的
		// （`|| {}` 兜底，见该文件 `list:` 那一行），所以旧代码没事。
		// 这里改读**元素注册表**（`uiEls`）：它是 `LayoutPanel.vue` 模板 `:ref` 登记的，
		// 而 Vue 挂载后才会走到 `vue-app-mounted` → `Editor.initialize()`，
		// 因此到此刻一定已经登记好；而且注册表始终反映**当前**元素，不受初始化时序影响。
		//
		// 注：store 的 `head` / `list` 也改成从同一张注册表派生了，所以两者同源；
		// 但这里仍直接读注册表——本地 `heads` 数组要的是**元素本身**，少一层 store 间接。
		uiEls.get('ui-head'),
		// ⚠️ 注册表在**没有挂载 Vue** 的环境里取不到元素（单测就是这种环境），
		// 而 `elementDataOf(undefined)` 会抛 `Invalid value used as weak map key`
		// —— 直接对 `uiEls.get(...)` 的结果调用它，会让
		// `layout-item-registry.spec.ts` 的 3 条用例全炸（2026-09-18 实测）。
		// `?? {}` 与遗留层 `ui-window.ts` 的 `list: (…) || {}` 是同一个手法：
		// 兜一个**真对象**进去，`.head` 读出来是 `undefined`，由消费侧
		// （`for (const head of Layout.heads ?? [])`）跳过。
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
  .command-list, file-body-content`;

	window.addEventListener('resize', this.windowResize!);
	window.addEventListener('localize', this.windowLocalize!);
	on(this.manager, 'switch', this.pageSwitch!);
	(window as unknown as Record<string, unknown>).__yamiLayoutDebug = () =>
		this.logDiagnostics!(true);
};

Layout.switchLayout = function (layout: Record<string, LayoutScheme>) {
	this.layout = layout;
	const { manager } = this;
	for (const page of manager.childNodes) {
		// M5-a：失效整本字典时清掉引擎内部页状态（原为 delete page.scheme）
		resetPageLayoutState(page as HTMLElement);
	}
	const key = manager.index;
	if (layout[key] !== undefined) {
		this.loadLayoutScheme!(key);
	}
};

Layout.updateGroups = (function IIFE() {
	const update = (group: LayoutGroupElement, split: string, start: number) => {
		// M4-2：结构变更窗口内可能传入已脱离文档的组，直接跳过而不是抛错中断
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
			// M4-2：结构变更中途可能出现过缺 manager 的组（Teleport 归属重算窗口），不因此中断
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
		// M4-2：Teleport 会在 nav 内留下锚点/文本等非元素节点，读取子序时跳过
		if (item.nodeType !== 1) continue;
		tabs.push((item as HTMLElement).getAttribute('value')!);
	}
	group.tabs = tabs;
	// M5-a：tabs 是运行时镜像的一部分，写入即刷新
	syncLayoutMirror(this.manager?.active as HTMLElement | null | undefined);
};

Layout.updateGroupInfo = function () {
	for (const info of getLayoutStore().resizing.infos) {
		const box = getDevicePixelContentBoxSize(info.manager);
		info.textContent = `${box.width} x ${box.height}`;
	}
};

// 调试日志：输出布局链各层级（窗口/page-frame/group/group-manager）的尺寸与定位
// 发现溢出或定位异常时自动输出（2秒节流），也可在控制台执行 __yamiLayoutDebug() 手动全量输出
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
			const walk = (group: LayoutGroupElement, depth: number): void => {
				const indent = ' '.repeat(depth * 2);
				const groupEnd = groupData(group).end;
				lines.push(
					`${indent}group: ${describe(group)} end:${groupEnd} split:${group.split ?? '-'}`
				);
				const groupManager = group.manager as PageManagerApi | undefined;
				if (groupManager !== undefined) {
					const gmRect = groupManager.getBoundingClientRect();
					lines.push(
						`${indent}  group-manager: ${describe(groupManager)} scrollTop:${groupManager.scrollTop}`
					);
					for (const child of Array.from(groupManager.children)) {
						if (!hasClass(child, 'page-frame')) continue;
						const frame = child as HTMLElement;
						const value = frame.getAttribute('value');
						const visible = hasClass(frame, 'visible');
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
				}
				for (const child of Array.from(group.children)) {
					if (hasClass(child, 'group')) {
						walk(child as LayoutGroupElement, depth + 1);
					}
				}
			};
			walk(root, 0);
		}
	}
	// P1b：布局诊断里改读注册表（原先 document.getElementById）
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
			for (const problem of problems) {
				console.warn(`- ${problem}`);
			}
			console.groupEnd();
			/* oxlint-enable no-console */
		}
	}
};

Layout.mergeGroups = (function IIFE() {
	const merge = (outer: LayoutGroupElement) => {
		const nodes = outer.childNodes as unknown as LayoutGroupElement[];
		let i = nodes.length;
		while (--i >= 0) {
			const inner = nodes[i];
			if (inner.split === outer.split) {
				// M5-b：Vue 会在容器内留锚点/文本节点，前一个兄弟须按元素回溯到「组」
				let prev = inner.previousElementSibling as LayoutGroupElement | null;
				while (prev !== null && !hasClass(prev, 'group')) {
					prev = prev.previousElementSibling as LayoutGroupElement | null;
				}
				const gs = prev === null ? 0 : (groupData(prev).end ?? 0);
				const ge = groupData(inner).end;
				const nodes = inner.childNodes as unknown as LayoutGroupElement[];
				while (nodes.length > 1) {
					const node = nodes[0];
					const end = groupData(node).end;
					// 这是由于两次划分变成了一次划分 而每次划分都是取得近似的整数值
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
	// 按「组元素」取兄弟：锚点/border 会让 end 运算变成 NaN
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
	if (next !== null) {
		size! += 1;
	}
	if (space !== 0) {
		let end = size! / space!;
		switch (direction) {
			case 'forward':
				if (prev) {
					end = groupData(prev).end + end;
				}
				if (next === null) {
					end = 1;
				}
				groupData(group).end = roundTo(end, 6);
				this.computeSizesBefore!(group);
				this.computeSizesAfter!(group);
				break;
			case 'backward':
				if (prev) {
					end = groupData(group).end - end;
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
		// 只对「组元素」序列做比例收敛（跳过锚点/border，否则 end 变 NaN）
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
		// 同上：按组元素序列收敛
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
			for (const group of node.childNodes as unknown as LayoutGroupElement[]) {
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

// 准备获得焦点 在获得焦点之前给群组添加ready-to-focus类来防止闪烁
// preventScroll 防止 focus 触发浏览器滚动（body overflow hidden 下 scrollY 变化会把顶栏滚出视口）
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

Layout.createGroupContent = function (group: LayoutGroupElement) {
	const nav = createNavBar();
	on(nav, 'write', this.navWrite!);
	on(nav, 'pointerdown', this.navPointerdown!);
	on(nav, 'dragstart', this.navDragstart!);
	on(nav, 'dragend', this.navDragend!);
	group.appendChild(nav);

	const manager = createPageManager();
	addClass(manager, 'group-manager');
	group.appendChild(manager);

	group.nav = nav;
	group.manager = manager;
};

Layout.createGroupBorder = function (group: LayoutGroupElement) {
	const border = renderElement(h('group-border', { class: 'group-border' }));
	on(border, 'pointerdown', this.borderPointerdown!);
	group.appendChild(border);

	group.border = border;
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
		// 因为禁用情况下可能会创建新元素(脚本参数) 因此记录已修改的元素再进行恢复更安全
		getLayoutStore().focusableElements = nodes;
	}
};

Layout.saveNavStates = function () {
	for (const item of this.items!.list) {
		if (hasClass(item, 'selected')) {
			const nav = item.parentNode as HTMLElement;
			// M5-a：会话恢复值存引擎内部（原为 nav.lastValue expando）
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
	// M5-b：唯一装载路径 —— 组树由 LayoutTreeView(.vue) 渲染并水合，
	// 页/页签经整壳 Teleport 落位；首载/二次进入由组树是否存在决定。
	const isFirst = pageSchemes.get(page) !== scheme;
	if (isFirst) {
		// M5-a：幂等判据存引擎内部（原为 page.scheme expando）
		pageSchemes.set(page, scheme);
	}
	const pending = this.loadLayoutSchemeVueTeleport!(key ?? '', scheme, page, isFirst);
	pending.catch((error: unknown) => {
		console.warn('[loadLayoutScheme(teleport)] failed:', error);
	});
	lastVueSchemeLoad = pending;
};

// Teleport 装载：宿主 page 上仅渲染/挂载 Vue 组树（不执行 clear，
// palette 等宿主页其它内容原样保留）；页/页签的落位完全由「归属发布 → 整壳 Teleport」驱动，
// 引擎不做命令式搬移。isFirst=true 为首次加载（先收回旧树托管值、卸载旧树再挂新树），
// false 为二次进入（组树不重建，仅重算归属并激活上次页签）。
Layout.loadLayoutSchemeVueTeleport = async function (
	_key: string,
	scheme: LayoutScheme,
	page: HTMLElement,
	isFirst: boolean
) {
	// 全局串行化：上一棵 Vue 组树加载完成后再开始本次
	const previous = lastVueSchemeLoad;
	if (previous !== null) {
		await previous.catch(() => {});
	}
	if (isFirst) {
		const prior = vueTreeHandles.get(page);
		if (prior !== undefined) {
			// 先收回旧树托管的页/页签归属（Teleport 内容退回 palette 宿主），再卸载组树，
			// 避免卸载时把仍挂在旧 manager 里的 Teleport 内容从文档中带走
			const values = hostedValues(prior.root);
			if (values.length !== 0) {
				getLayoutStore().removePageTargets(values);
				getLayoutStore().removeTabTargets(values);
				// 陈旧（已脱离文档）归属一并清掉：否则 Teleport 会向死容器搬运
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
		// 无既有组树（例如运行期才切到 teleport 模式）：按首载处理
		return this.loadLayoutSchemeVueTeleport!(_key, scheme, page, true);
	}

	// 归属发布：页 → 叶子 manager、页签 → 叶子 nav（数据驱动，取代命令式搬移）
	const leaves = publishLeafTargets(layoutRootOf(page));
	await nextTick(); // 等待 Teleport 把整壳节点搬进对应叶子宿主
	for (const leaf of leaves) {
		orderLeafHostChildren(leaf);
		if (isFirst) {
			write(leaf.nav!, leaf.tabs?.[0]);
		} else {
			// M5-a：二次进入的会话恢复值读引擎内部（原为 nav.lastValue expando）
			write(leaf.nav!, navLastValues.get(leaf.nav!) ?? leaf.tabs?.[0]);
		}
	}
	this.updateGroups!();
	syncLayoutMirror(page);
	syncPageTargets(this.manager);
};

// M4-2（layout 迁移规划 M4）：Teleport 模式下结构性 drop（跨组搬入/region 分割）
// 的命令式 DOM 变更后，Vue 组树的认知已与 DOM 失配（后续拖拽/补丁会在失配树上失效，
// 2026-09-09 真机探针）。这里把「当前 DOM → scheme」写回 layout 并整树重挂载，
// 使 Vue 树重新成为 DOM 的忠实渲染；命令式效果本身保持不变（保留到 M5）。
Layout.rebuildVueLayoutFromDom = async function (
	key?: string,
	activateTab?: string
): Promise<void> {
	// 仅对「Vue 组树托管」的宿主做重挂载（手工搭建 DOM 的测试环境无树可同步）
	const target = this.manager?.active as
		| (HTMLElement & { scheme?: LayoutScheme })
		| null
		| undefined;
	if (!target || vueTreeHandles.get(target) === undefined) return;
	// 先串行化到上一棵加载，再自行内联挂载（不复用 loadLayoutSchemeVueTeleport：
	// 后者会读取 lastVueSchemeLoad，而本函数自身即被登记为其值，会自锁）。
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
	// 规整冗余容器：Teleport 组树无容器 border，命令式折叠后可能残留单子组容器
	const scheme = toLayoutScheme(
		collapseRedundantSplits(parseLayoutScheme(this.saveLayoutScheme!(root) as LayoutSchemeData))
	);
	const layout = (this.layout ??= {} as Record<string, LayoutScheme>);
	layout[layoutKey] = scheme;
	pageSchemes.set(page, scheme);

	const prior = vueTreeHandles.get(page);
	if (prior !== undefined) {
		// 收回归属：「当前 DOM 叶子」与「旧树叶子 expando」的并集都要收回，
		// 否则失效映射会把 Teleport 内容搬进即将卸载的旧宿主（内容丢失）。
		const values = new Set<string>();
		for (const value of hostedValues(root)) values.add(value);
		for (const value of hostedValues(prior.root)) values.add(value);
		if (values.size !== 0) {
			const list = Array.from(values);
			getLayoutStore().removePageTargets(list);
			getLayoutStore().removeTabTargets(list);
			// 陈旧（已脱离文档）归属一并清掉：否则 Teleport 会向死容器搬运
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
		navWrite: this.navWrite!,
		navPointerdown: this.navPointerdown!,
		navDragstart: this.navDragstart!,
		navDragend: this.navDragend!,
		borderPointerdown: this.borderPointerdown!
	});
	vueTreeHandles.set(page, handle);

	const leaves = publishLeafTargets(handle.root);
	await nextTick();
	for (const leaf of leaves) {
		orderLeafHostChildren(leaf);
		write(leaf.nav!, leaf.tabs?.[0]);
	}
	this.updateGroups!();
	syncLayoutMirror(page);
	syncPageTargets(this.manager);

	if (activateTab !== undefined) {
		for (const leaf of leaves) {
			if ((leaf.tabs ?? []).includes(activateTab)) {
				write(leaf.nav!, activateTab);
				break;
			}
		}
	}
};

Layout.saveToConfig = function (config: { layout?: Record<string, LayoutScheme> | null }) {
	const { layout } = this;
	for (const page of this.manager.childNodes) {
		const key = page.getAttribute('value');
		if (pageSchemes.get(page as HTMLElement) === layout![key]) {
			// M5-a：优先读运行时镜像（收敛点刷新），无镜像时再按 DOM 兜底快照
			const mirrored = pageTrees.get(page as HTMLElement);
			const scheme =
				mirrored ??
				(layoutRootOf(page) !== null ? this.saveLayoutScheme!(layoutRootOf(page)!) : null);
			// M4-2：半挂载/空树不覆盖既有布局（否则一次失败挂载会写坏 config.layout）
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
			// 同 heads 的教训：当年 `getUIStore().body` 在 UI 窗口**关闭**时是 null
			// （`ui-file.ts` 的 close 会经桥接把它置空），而 `UI.body` 是 `hide(uiEls.get("ui-body"))`
			// 的结果 —— 一个始终存在的元素（关闭时只是被隐藏，不是 null）。
			// 所以这里读元素注册表：既能拿到元素，也不会在未打开时变成 null。
			// （store 的 `body` 现已同源改成注册表 `computed`，两者等价；此处保留直读以少一层间接。）
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
	// 切页签后重新量尺寸：新激活的页面此前可能处于隐藏态（宽高缓存缺失/dpr 未记录），
	// 不派发 resize 会让其画布停在 0×0（场景/动画预览空白 + WebGL 零尺寸帧缓冲报错）。
	Layout.updateGroups!();
	// 同 tick 内新页面尚未完成布局（读到 0 尺寸），下一帧再收敛一次尺寸并派发 resize
	if (typeof requestAnimationFrame === 'function') {
		requestAnimationFrame(() => Layout.updateGroups!());
	}
};

/**
 * 把某个页面切到所属叶子的前台（打开窗口时调用）。
 * 页面可能因同一叶子激活了其它页签而处于 `display:none`（此时画布/尺寸为 0），
 * 打开窗口却不激活它就会出现「窗口开了但内容空白」。
 *
 * 注意：工作区布局装载是异步的（`loadLayoutSchemeVueTeleport`），其尾部会按默认页签激活叶子；
 * 若此刻直接写 nav 会被随后完成的装载覆盖（真机表现为 resize 量到 clientWidth 0），
 * 因此这里串行到装载完成之后再激活。
 */
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
	// 先立即生效；若仍有装载在途，装载尾部的默认页签激活会覆盖它，故装载完成后再补一次（幂等）
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
						// M5-a：页签↔页配对读引擎内部（原为 element.page expando）
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
			if (head) head.style.pointerEvents = 'none';
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
			if (head) head.style.pointerEvents = '';
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

		// M4：同组 drop（inside）走数据路径 —— 行为与命令式等价（layout-nav-drop.spec.ts 金标准钉死），
		// 生效动作 = 更新 tabs 数据 + 排序 pass，避免对 Vue/Teleport 管理的子节点直接 insertBefore。
		if (direction === 'inside' && target === sGroup) {
			applyTabDropWithin(sGroup, item, trigger);
			syncLayoutMirror(Layout.manager?.active);
			syncPageTargets(Layout.manager);
			return;
		}

		let parent = target.parentNode;
		let dGroup: LayoutGroupElement = target as LayoutGroupElement;
		let split;
		switch (direction) {
			case 'left':
			case 'right':
				split = 'horizontal';
				break;
			case 'top':
			case 'bottom':
				split = 'vertical';
				break;
		}

		if (split !== undefined && parent.split !== split) {
			parent.replaceChild((parent = renderElement(h('group', { class: 'group' }))), target);
			groupData(parent).end = groupData(target).end;
			parent.split = split;
			addClass(parent, split);
			parent.style.left = target.style.left;
			parent.style.top = target.style.top;
			parent.style.width = target.style.width;
			parent.style.height = target.style.height;
			parent.appendChild(target);
			groupData(target).end = 1;
			Layout.createGroupBorder!(parent);
		}

		// 落位分割点：hint 语义为「目标盒子的一半」（见 updateHint），
		// 因此新叶子与目标叶子在目标跨度中点处对分；此前 left/top 分支未设 end、
		// right/bottom 分支未收缩目标 end，导致两叶 end 都为 1（重叠 → 边界线不可拖拽缩放）。
		let prev = target.previousElementSibling as LayoutGroupElement | null;
		while (prev !== null && !hasClass(prev, 'group')) {
			prev = prev.previousElementSibling as LayoutGroupElement | null;
		}
		const spanStart = prev === null ? 0 : (groupData(prev).end ?? 0);
		const spanEnd = groupData(target).end ?? 1;
		const spanMid = (spanStart + spanEnd) / 2;

		switch (direction) {
			case 'inside':
				dGroup = target;
				break;
			case 'left':
			case 'top':
				dGroup = renderElement(h('group', { class: 'group' })) as LayoutGroupElement;
				groupData(dGroup).end = spanMid;
				parent.insertBefore(dGroup, target);
				Layout.createGroupContent!(dGroup);
				Layout.createGroupBorder!(dGroup);
				break;
			case 'right':
			case 'bottom':
				dGroup = renderElement(h('group', { class: 'group' })) as LayoutGroupElement;
				groupData(dGroup).end = spanEnd;
				groupData(target).end = spanMid;
				parent.insertBefore(dGroup, target.nextSibling);
				Layout.createGroupContent!(dGroup);
				Layout.createGroupBorder!(dGroup);
				break;
		}

		const sNav = sGroup.nav;
		const dNav = dGroup.nav;
		const sManager = sGroup.manager;
		const dManager = dGroup.manager;
		if (sNav !== dNav) {
			write(dNav, null);
			dManager.index = sManager.index;
			dManager.active = sManager.active;
			sManager.index = null;
			sManager.active = null;
		}

		// M5-a：页签↔页配对读引擎内部（原为 item.page / trigger.page expando）
		const page = itemPages.get(item as HTMLElement);
		const triggerPage = itemPages.get(trigger);
		if (hasClass(trigger, 'nav-item') && page && triggerPage) {
			dNav.insertBefore(item, trigger);
			dManager.insertBefore(page, triggerPage);
		} else if (page) {
			dNav.appendChild(item);
			dManager.appendChild(page);
		} else {
			dNav.appendChild(item);
		}

		Layout.updateGroupTabs!(sGroup);
		Layout.updateGroupTabs!(dGroup);

		// 擦除页面的宽高属性 调整节点树后滚动条会重置 需要触发调整事件来恢复
		if (page) {
			const sized = page as HTMLElement & { width: unknown; height: unknown };
			sized.width = null;
			sized.height = null;
		}

		if (sNav !== dNav) {
			// M4-2：以元素子节点判定源组是否还有页签（Teleport 锚点不算）
			const remaining = Array.from(sNav.children).find((child) =>
				hasClass(child, 'nav-item')
			) as HTMLElement | undefined;
			if (remaining !== undefined) {
				write(sNav, remaining.getAttribute('value'));
			} else {
				const pGroup = sGroup.parentNode as LayoutGroupElement;
				// 按组元素判定（锚点会让 childNodes/previousSibling 判定失真）
				const siblings = groupChildrenOf(pGroup);
				const prev = prevGroupOf(sGroup);
				if (prev !== null && nextGroupOf(sGroup) === null) {
					groupData(prev).end = 1;
				}
				sGroup.remove();

				if (siblings.length === 2) {
					const survivor = siblings.find((group) => group !== sGroup);
					if (survivor !== undefined) {
						groupData(survivor).end = groupData(pGroup).end;
						pGroup.parentNode!.replaceChild(survivor, pGroup);
					}
				}
			}

			switch (direction) {
				case 'left':
				case 'top':
					Layout.mergeGroups!();
					Layout.setGroupSize!(dGroup, hint, 'forward');
					break;
				case 'right':
				case 'bottom':
					Layout.mergeGroups!();
					Layout.setGroupSize!(dGroup, hint, 'backward');
					break;
			}

			Layout.updateGroups!(true);
			Layout.navPointerdown!({
				button: 0,
				target: item
			});
		}
	}
	// M4-2：跨组/分割 drop 的命令式变更会与 Vue 组树失配，回写 scheme 并重挂载组树
	// （同组重排走上方数据路径，不受影响；无 Vue 树时 rebuild 内部直接返回）。
	{
		const pending = Layout.rebuildVueLayoutFromDom!(undefined, draggedValue);
		lastVueSchemeLoad = pending;
		pending.catch((error: unknown) => {
			console.warn('[rebuildVueLayoutFromDom] failed:', error);
		});
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
	// event.preventDefault()
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
		// M5-a：缩放结束刷新布局镜像（end 比例是镜像的一部分）
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
			(getLayoutStore() as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
