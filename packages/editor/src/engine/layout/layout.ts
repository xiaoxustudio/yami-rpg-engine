/* oxlint-disable eslint/no-restricted-properties */
import { relate, hideDragImage, getRelativeCoords } from '@app/utils/element-utils';
import { getBrowserInstance } from '@app/stores/browser.ts';
import { $ } from '@app/utils/dom';
import {
	on,
	off,
	addClass,
	removeClass,
	hasClass,
	rect,
	clear,
	write,
	dispatchResizeEvent
} from '@app/utils/element-utils.ts';
import {
	createDragAndDropHintElement as createDragAndDropHint,
	createNavBarElement as createNavBar,
	createPageManagerElement as createPageManager,
	type PageManagerApi
} from '@ui-kit';
import { toLayoutScheme, moveTabWithin, type LayoutSchemeData } from './layout-scheme';
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
import { UI } from '@app/ui/ui-window.ts';
import { DynamicShape } from '@app/types/shapes.ts';
import { h, nextTick, render, type VNode } from 'vue';

// M3b-2 双路开关（docs/layout-vue-plan.md 附录 E.1）：默认命令式路径；打开后
// loadLayoutScheme 首载改走 Vue 渲染。取值：
//   0/关 —— 命令式（现状）
//   1/true/on —— M3b-2a 中间态：Vue 组树渲染 + 水合，页/页签命令式搬移
//   2/teleport —— M3b-2b：Vue 组树 + 数据驱动归属发布，页/页签经整壳 Teleport 落位
// jsdom/无 localStorage 时回退 0。
const layoutVueRenderGate = (() => {
	try {
		const value = localStorage.getItem('YM_LAYOUT_VUE_RENDER') ?? '';
		if (/^(2|teleport)$/i.test(value)) return 2;
		return /^(1|true|on)$/i.test(value) ? 1 : 0;
	} catch {
		return 0;
	}
})();

let vueRenderMode = layoutVueRenderGate;
// 每个宿主 page 上挂载中的 Vue 组树（再次首载/切布局时先收回页签再 unmount）
const vueTreeHandles = new WeakMap<HTMLElement, VueGroupTreeHandle>();
// 最近一次 Vue 渲染加载（供 loadLayoutScheme fire-and-forget 后测试/时序方等待）
let lastVueSchemeLoad: Promise<void> | null = null;

export function isLayoutVueRenderEnabled(): boolean {
	return vueRenderMode !== 0;
}

export function setLayoutVueRenderEnabled(enabled: boolean): void {
	vueRenderMode = enabled ? 1 : 0;
}

export function getLayoutVueRenderMode(): number {
	return vueRenderMode;
}

export function setLayoutVueRenderMode(mode: number): void {
	vueRenderMode = mode;
}

export function awaitVueLayoutLoad(): Promise<void> {
	return lastVueSchemeLoad ?? Promise.resolve();
}

interface LayoutScheme {
	end: number;
	split?: string;
	children?: LayoutScheme[];
	tabs?: string[];
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

type LayoutItemElement = HTMLElement & {
	page?: HTMLElement;
};

type LayoutItems = Record<string, LayoutItemElement> & {
	list: LayoutItemElement[];
};

type LayoutGroupElement = HTMLElement & {
	end: number;
	split?: string;
	tabs?: string[];
	nav: HTMLElement;
	manager: PageManagerApi;
	border?: HTMLElement;
};

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
	const host = document.createElement('div');
	render(vnode, host);
	const element = host.firstElementChild as HTMLElement;
	host.removeChild(element);
	return element;
}

// 结构/归属收敛点后把「value → 归属 manager」刷进 layout store，供 Vue 层 Teleport :to 使用。
const syncPageTargets = (
	manager: {
		active: { firstElementChild?: Element | null } | null;
	} | null
): void => {
	if (manager === null) return;
	const active = manager.active;
	const root = active?.firstElementChild ?? null;
	getLayoutStore().setPageTargets(collectPageTargets(root));
};

// ---- M3b-2b Teleport 模式辅助（docs/layout-vue-plan.md 附录 F）----
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

// M4（docs/layout-vue-plan.md M4）：同组 drop（inside）生效动作数据化。
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
	const page = item.page;
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
	afterChange: null as (() => void) | null,
	initialize: null as (() => void) | null,
	switchLayout: null as ((layout: Record<string, LayoutScheme>) => void) | null,
	createGroups: null as ((item: LayoutScheme, parent: HTMLElement) => void) | null,
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
	createGroupContent: null as ((group: LayoutGroupElement) => void) | null,
	createGroupBorder: null as ((group: LayoutGroupElement) => void) | null,
	enableFocusableElements: null as (() => void) | null,
	disableFocusableElements: null as (() => void) | null,
	saveNavStates: null as (() => void) | null,
	saveLayoutScheme: null as ((rootGroup?: LayoutGroupElement) => LayoutScheme) | null,
	loadLayoutScheme: null as ((key?: string) => void) | null,
	loadLayoutSchemeVue: null as
		| ((key: string, scheme: LayoutScheme, page: HTMLElement) => Promise<void>)
		| null,
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
	borderPointerdown: null as ((event: Event & LayoutResizeEvent) => void) | null,
	pointerup: null as ((event?: EditorEvent) => void) | null,
	pointermove: null as ((event: EditorEvent) => void) | null
};

Layout.initialize = function () {
	this.manager = $('#workspace-page-manager');
	const nav = $('#layout-nav');
	const manager = $('#layout-page-manager');
	const items = (this.items = {} as LayoutItems);
	for (const item of nav.childNodes) {
		if (item.nodeType !== 1) continue;
		const key = item.getAttribute('value');
		(item as HTMLElement).draggable = true;
		items[key!] = item as LayoutItemElement;
	}
	for (const page of manager.childNodes) {
		if (page.nodeType !== 1) continue;
		const key = page.getAttribute('value');
		if (key && items[key]) {
			items[key].page = page as HTMLElement;
		}
	}

	Object.defineProperty(items, 'list', {
		value: Object.values(items)
	});

	this.heads = [
		Scene.head,
		Scene.list.head,
		UI.head,
		UI.list.head,
		Animation.head,
		Animation.list.head,
		Animation.timeline.head,
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
		if (page.scheme !== undefined) {
			delete page.scheme;
		}
	}
	const key = manager.index;
	if (layout[key] !== undefined) {
		this.loadLayoutScheme!(key);
	}
};

Layout.createGroups = function (item: LayoutScheme, parent: HTMLElement) {
	const group = renderElement(h('group', { class: 'group' }));
	parent.appendChild(group);
	if (item.children) {
		(group as LayoutGroupElement).end = item.end;
		(group as LayoutGroupElement).split = item.split;
		addClass(group, item.split!);

		for (const child of item.children) {
			this.createGroups!(child, group);
		}
	} else {
		const { end, tabs } = item;
		(group as LayoutGroupElement).end = end;
		(group as LayoutGroupElement).tabs = tabs;
		this.createGroupContent!(group);

		const nav = (group as LayoutGroupElement).nav;
		const manager = (group as LayoutGroupElement).manager;
		for (const tab of tabs!) {
			const item = this.items![tab];
			if (item) {
				nav.appendChild(item);
				manager.appendChild(item.page!);
			} else {
				console.warn('missing item for tab:', tab);
			}
		}
	}

	this.createGroupBorder!(group);
};

Layout.updateGroups = (function IIFE() {
	const update = (group: LayoutGroupElement, split: string, start: number) => {
		const end = group.end;
		const style = group.style;
		switch (split) {
			case 'horizontal': {
				const pn = group.parentNode as LayoutGroupElement;
				const pw = pn.clientWidth;
				const sl = CSS.rasterize(pw * start);
				const sr = CSS.rasterize(pw * end);
				style.left = `${sl}px`;
				style.top = '0';
				style.width = `${sr - sl}px`;
				style.height = '100%';
				break;
			}
			case 'vertical': {
				const pn = group.parentNode as LayoutGroupElement;
				const ph = pn.clientHeight;
				const st = CSS.rasterize(ph * start);
				const sb = CSS.rasterize(ph * end);
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
			const active = group.manager.active as
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
		switch (this.manager.index) {
			case null:
			case 'home':
				return;
		}
		const page = this.manager.active;
		const root = page?.childNodes?.[0];
		if (!root) return;
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
		tabs.push(item.getAttribute('value')!);
	}
	group.tabs = tabs;
};

Layout.updateGroupInfo = function () {
	for (const info of getLayoutStore().resizing.infos) {
		const box = CSS.getDevicePixelContentBoxSize(info.manager);
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
		const root = page.childNodes[0] as LayoutGroupElement | undefined;
		if (root !== undefined && hasClass(root, 'group')) {
			const walk = (group: LayoutGroupElement, depth: number): void => {
				const indent = ' '.repeat(depth * 2);
				lines.push(
					`${indent}group: ${describe(group)} end:${group.end} split:${group.split ?? '-'}`
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
	const browser = document.getElementById('project-browser');
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
				const prev = inner.previousSibling as LayoutGroupElement | null;
				const gs = prev ? prev.end : 0;
				const ge = inner.end;
				const nodes = inner.childNodes as unknown as LayoutGroupElement[];
				while (nodes.length > 1) {
					const node = nodes[0];
					const end = node.end;
					// 这是由于两次划分变成了一次划分 而每次划分都是取得近似的整数值
					if (end !== undefined) {
						node.end = Math.roundTo(gs * (1 - end) + ge * end, 6);
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
		merge(this.manager.active.childNodes[0]);
	};
})();

Layout.setGroupSize = function (
	group: LayoutGroupElement,
	hint: { width: number; height: number },
	direction: 'forward' | 'backward'
) {
	const parent = group.parentNode as LayoutGroupElement;
	const prev = group.previousSibling as LayoutGroupElement | null;
	const next = group.nextSibling as LayoutGroupElement | null;
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
	if (hasClass(next!, 'group')) {
		size! += 1;
	}
	if (space !== 0) {
		let end = size! / space!;
		switch (direction) {
			case 'forward':
				if (prev) {
					end = prev.end + end;
				}
				if (next === parent.border) {
					end = 1;
				}
				group.end = Math.roundTo(end, 6);
				this.computeSizesBefore!(group);
				this.computeSizesAfter!(group);
				break;
			case 'backward':
				if (prev) {
					end = group.end - end;
					prev.end = Math.roundTo(end, 6);
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
		const nodes = parent.childNodes as unknown as LayoutGroupElement[];
		const index = Array.prototype.indexOf.call(nodes, group);
		const groups = Array.prototype.slice.call(nodes, 0, index + 1) as LayoutGroupElement[];
		const head = nodes[0];
		const length = groups.length;
		const min = Math.min(0.1, 32 / space);
		for (let i = length - 2, end = group.end; i >= 0; i--) {
			const group = groups[i];
			const pad = 2;
			end = Math.min(group.end, end - min - pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
		}
		for (let i = 0, end = 0; i < length; i++) {
			const group = groups[i];
			const pad = (group === head ? 0 : 1) + 1;
			end = Math.max(group.end, end + min + pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
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
		const nodes = parent.childNodes as unknown as LayoutGroupElement[];
		const index = Array.prototype.indexOf.call(nodes, group);
		const groups = Array.prototype.slice.call(nodes, index, -1) as LayoutGroupElement[];
		const foot = nodes[nodes.length - 2];
		const last = groups.length - 1;
		const min = Math.min(0.1, 32 / space);
		for (let i = 0, end = 0; i < last; i++) {
			const group = groups[i];
			const pad = 2;
			end = Math.max(group.end, end + min + pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
		}
		for (let i = last - 1, end = 1; i >= 0; i--) {
			const group = groups[i];
			const pad = (groups[i + 1] === foot ? 0 : 1) + 1;
			end = Math.min(group.end, end - min - pad / space);
			end = Math.roundTo(end, 6);
			group.end = end;
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
		return find([], this.manager.active.childNodes[0]);
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
			const nav = item.parentNode;
			nav.lastValue = item.getAttribute('value');
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
	if (page.scheme !== scheme) {
		page.scheme = scheme;
		if (vueRenderMode === 2) {
			// Teleport 模式（M3b-2b，默认关）：组树 Vue 渲染+水合后按叶子发布归属，
			// palette 页/页签经整壳 Teleport 落位，不做命令式搬移（docs/layout-vue-plan.md 附录 F）。
			const pending = this.loadLayoutSchemeVueTeleport!(key ?? '', scheme, page, true);
			pending.catch((error: unknown) => {
				console.warn('[loadLayoutScheme(teleport)] failed:', error);
			});
			lastVueSchemeLoad = pending;
			return;
		}
		if (vueRenderMode === 1) {
			// Vue 渲染路径（M3b-2a，默认关）：结构/叶子宿主由 LayoutTreeView(.vue) 渲染并水合，
			// 语义与下方命令式首载分支等价。
			const pending = this.loadLayoutSchemeVue!(key ?? '', scheme, page);
			pending.catch((error: unknown) => {
				console.warn('[loadLayoutScheme(vue)] failed:', error);
			});
			lastVueSchemeLoad = pending;
			return;
		}
		this.createGroups!(scheme, clear(page));
		this.updateGroups!();
		const groups = this.getKeyGroups!();
		for (const group of groups) {
			write(group.nav, group.tabs[0]);
		}
	} else {
		if (vueRenderMode === 2) {
			// 二次进入：不重建组树，只重算归属并激活 nav.lastValue（Teleport 负责落位）
			const pending = this.loadLayoutSchemeVueTeleport!(key ?? '', scheme, page, false);
			pending.catch((error: unknown) => {
				console.warn('[loadLayoutScheme(teleport/restore)] failed:', error);
			});
			lastVueSchemeLoad = pending;
			return;
		}
		const items = this.items!;
		const groups = this.getKeyGroups!();
		for (const group of groups) {
			const { tabs, nav, manager } = group;
			for (const tab of tabs) {
				const item = items[tab];
				nav.appendChild(item);
				manager.appendChild(item.page!);
			}
		}
		this.updateGroups!(true);
		for (const { nav } of groups) {
			write(nav, nav.lastValue);
		}
	}
	syncPageTargets(this.manager);
};

// 与 loadLayoutScheme 首载分支语义等价的 Vue 渲染加载（M3b-2，默认关）。
// 宿主 page 上已有 Vue 组树时先 unmount；清空 page 后 mountVueGroupTree 渲染+水合，
// 再把 palette 的页/页签搬进叶子宿主并激活各 group 首 tab，尾部与命令式一致（syncPageTargets）。
Layout.loadLayoutSchemeVue = async function (
	_key: string,
	scheme: LayoutScheme,
	page: HTMLElement
) {
	// 全局串行化：上一棵 Vue 组树加载完成后再开始本次（快速切换工作区时避免交错挂载）。
	const previous = lastVueSchemeLoad;
	if (previous !== null) {
		await previous.catch(() => {});
	}
	const prior = vueTreeHandles.get(page);
	if (prior !== undefined) {
		prior.unmount();
		vueTreeHandles.delete(page);
	}
	clear(page);
	const handle = await mountVueGroupTree(page, scheme as LayoutSchemeData, {
		navWrite: this.navWrite!,
		navPointerdown: this.navPointerdown!,
		navDragstart: this.navDragstart!,
		navDragend: this.navDragend!,
		borderPointerdown: this.borderPointerdown!
	});
	vueTreeHandles.set(page, handle);

	const items = this.items!;
	for (const leaf of handle.leaves) {
		for (const tab of leaf.tabs) {
			const item = items[tab];
			if (item) {
				leaf.nav.appendChild(item);
				leaf.manager.appendChild(item.page!);
			} else {
				console.warn('missing item for tab:', tab);
			}
		}
	}
	this.updateGroups!();
	const groups = this.getKeyGroups!();
	for (const group of groups) {
		write(group.nav, group.tabs[0]);
	}
	syncPageTargets(this.manager);
};

// Teleport 模式（M3b-2b，默认关）：宿主 page 上仅渲染/挂载 Vue 组树（不执行 clear，
// palette 等宿主页其它内容原样保留）；页/页签的落位完全由「归属发布 → 整壳 Teleport」驱动，
// 引擎不做命令式搬移。isFirst=true 为首次加载（先收回旧树托管值、卸载旧树再挂新树），
// false 为二次进入（组树不重建，仅重算归属并激活 nav.lastValue）。
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
	} else if (vueTreeHandles.get(page) === undefined && page.firstElementChild === null) {
		// 无既有组树（例如运行期才切到 teleport 模式）：按首载处理
		return this.loadLayoutSchemeVueTeleport!(_key, scheme, page, true);
	}

	// 归属发布：页 → 叶子 manager、页签 → 叶子 nav（数据驱动，取代命令式搬移）
	const leaves = publishLeafTargets(page.firstElementChild as HTMLElement | null);
	await nextTick(); // 等待 Teleport 把整壳节点搬进对应叶子宿主
	for (const leaf of leaves) {
		orderLeafHostChildren(leaf);
		if (isFirst) {
			write(leaf.nav!, leaf.tabs?.[0]);
		} else {
			write(
				leaf.nav!,
				(leaf.nav as HTMLElement & { lastValue?: string }).lastValue ?? leaf.tabs?.[0]
			);
		}
	}
	this.updateGroups!();
	syncPageTargets(this.manager);
};

Layout.saveToConfig = function (config: { layout?: Record<string, LayoutScheme> | null }) {
	const { layout } = this;
	for (const page of this.manager.childNodes) {
		const key = page.getAttribute('value');
		if (page.scheme !== undefined && page.scheme === layout![key]) {
			const root = page.childNodes[0];
			layout![key] = this.saveLayoutScheme!(root);
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

Layout.pageSwitch = function (event: EditorEvent) {
	try {
		switch (event.last) {
			case 'scene':
				Scene.save!();
				Scene.close!();
				break;
			case 'ui':
				UI.save();
				UI.close();
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
			const body = UI.body;
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
	this.afterChange?.();
};

Layout.navWrite = function (this: typeof Layout, event: EditorEvent) {
	const index = event.value;
	(this as typeof Layout).parentNode.manager.switch(index);
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
						const page = element.page!;
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
		event.preventDefault = Function.empty;
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
		for (const head of Layout.heads!) {
			head.style.pointerEvents = 'none';
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
		for (const head of Layout.heads!) {
			head.style.pointerEvents = '';
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
		const sItems = sNav.childNodes;
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
	if (dragging.location) {
		const sGroup = dragging.group;
		const item = dragging.target;
		const { hint } = dragging;
		const { location } = dragging;
		const { trigger } = location;
		const { target } = location;
		const { direction } = location;

		// M4：Teleport 模式（默认关）同组 drop（inside）走数据路径 —— 行为与命令式等价
		// （layout-nav-drop.spec.ts 金标准钉死），但生效动作 = 更新 tabs 数据 + 排序 pass，
		// 避免对 Vue/Teleport 管理的子节点直接 insertBefore；命令式路径（模式 0/1）保留到 M5。
		if (vueRenderMode === 2 && direction === 'inside' && target === sGroup) {
			applyTabDropWithin(sGroup, item, trigger);
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
			parent.end = target.end;
			parent.split = split;
			addClass(parent, split);
			parent.style.left = target.style.left;
			parent.style.top = target.style.top;
			parent.style.width = target.style.width;
			parent.style.height = target.style.height;
			parent.appendChild(target);
			target.end = 1;
			Layout.createGroupBorder!(parent);
		}

		switch (direction) {
			case 'inside':
				dGroup = target;
				break;
			case 'left':
			case 'top':
				dGroup = renderElement(h('group', { class: 'group' })) as LayoutGroupElement;
				parent.insertBefore(dGroup, target);
				Layout.createGroupContent!(dGroup);
				Layout.createGroupBorder!(dGroup);
				break;
			case 'right':
			case 'bottom':
				dGroup = renderElement(h('group', { class: 'group' })) as LayoutGroupElement;
				dGroup.end = target.end;
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

		const page = item.page;
		if (hasClass(trigger, 'nav-item')) {
			dNav.insertBefore(item, trigger);
			dManager.insertBefore(page, trigger.page);
		} else {
			dNav.appendChild(item);
			dManager.appendChild(page);
		}

		Layout.updateGroupTabs!(sGroup);
		Layout.updateGroupTabs!(dGroup);

		// 擦除页面的宽高属性 调整节点树后滚动条会重置 需要触发调整事件来恢复
		page.width = null;
		page.height = null;

		if (sNav !== dNav) {
			if (sNav.hasChildNodes()) {
				write(sNav, sNav.childNodes[0].getAttribute('value'));
			} else {
				const pGroup = sGroup.parentNode;
				const prev = sGroup.previousSibling;
				const next = sGroup.nextSibling;
				const border = pGroup.border;
				const nodes = pGroup.childNodes;
				if (prev && next === border) {
					prev.end = 1;
				}
				sGroup.remove();

				if (nodes.length === 2) {
					nodes[0].end = pGroup.end;
					pGroup.parentNode.replaceChild(nodes[0], pGroup);
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
		const root = Layout.manager.active.childNodes[0];
		let target: HTMLElement = (this as HTMLElement & typeof Layout).parentNode as HTMLElement;
		let parent: HTMLElement = target.parentNode as HTMLElement;
		let siblings = parent.childNodes;
		let direction;
		if (root.split) {
			const { x, y } = getRelativeCoords(event, root);
			const w = root.clientWidth;
			const h = root.clientHeight;
			const nodes = root.childNodes;
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
				const sItems = sGroup.nav.childNodes;
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

Layout.borderPointerdown = function (this: typeof Layout, event: Event & LayoutResizeEvent) {
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
						event.startX = Math.round(outer.clientWidth * group.end);
						Cursor.open('cursor-col-resize');
						break;
					case 'vertical':
						event.mode = 'row-resize';
						event.startY = Math.round(outer.clientHeight * group.end);
						Cursor.open('cursor-row-resize');
						break;
				}
				event.outer = outer;
				event.group = group;
				event.end = group.end;
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
		window.removeEventListener('pointerup', Layout.pointerup!);
		window.removeEventListener('pointermove', Layout.pointermove!);
	}
};

Layout.pointermove = function (event: EditorEvent) {
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
	end = Math.clamp(end!, 0, 1);
	end = Math.roundTo(end!, 6);
	if (end !== undefined) {
		const { group } = resizing;
		const lastEnd = group.end;
		if (lastEnd !== end) {
			group.end = end;
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

for (const key of layoutBridgeKeys) {
	Object.defineProperty(Layout, key, {
		get: () => getLayoutStore()[key],
		set: (value: unknown) => {
			(getLayoutStore() as unknown as Record<string, unknown>)[key] = value;
		},
		configurable: true
	});
}
