// Vue group 树挂载/水合层（docs/layout-vue-plan.md M3b-1，C.5#1）
// 供双路开关的 Vue 分支使用：把数据树经 LayoutTreeView 渲染进宿主 page，
// 再把命令式布局引擎所需的 expando（end/split/tabs/nav/manager/border）与事件接线
// 绑到 Vue 渲染出的 DOM 上——叶子 nav/manager 由 YMNavBar/YMPageManager .vue 在
// onMounted 时把命令式 API 挂到 root 元素，因此引擎侧可零改动继续命令式驱动。

import { h, nextTick, render, type VNode } from 'vue';
import type { PageManagerApi } from '@ui-kit';
import LayoutTreeView from '@app/components/layout/LayoutTreeView.vue';
import { on } from '@app/utils/element-utils';
import { parseLayoutScheme, type LayoutSchemeData, type LayoutTreeNode } from './layout-scheme';

const GROUP_CLASS = 'group';
const NAV_CLASS = 'nav-bar';
const MANAGER_CLASS = 'page-manager';
const BORDER_CLASS = 'group-border';

const isGroup = (el: Element): boolean => el.classList.contains(GROUP_CLASS);

type LayoutGroupHost = HTMLElement & {
	end?: number;
	split?: string;
	tabs?: string[];
	nav?: HTMLElement;
	manager?: PageManagerApi;
	border?: HTMLElement;
};

export interface VueLeafHost {
	/** 叶子 .group 元素（引擎侧 expando 载体，parentNode 即该 group） */
	element: HTMLElement;
	/** YMNavBar root：read/write/unselect/on 已挂载 */
	nav: HTMLElement;
	/** YMPageManager root：switch/on/index/active 已挂载 */
	manager: PageManagerApi;
	border: HTMLElement;
	tabs: string[];
}

export interface VueGroupTreeHandle {
	/** 根 .group 元素（宿主 page 的 firstElementChild） */
	root: HTMLElement;
	leaves: VueLeafHost[];
	/** 卸载整棵 Vue 渲染树（只移除组树，不动宿主页内其它内容） */
	unmount: () => void;
}

export interface VueLeafEventHandlers {
	navWrite?: (event: Event) => void;
	navPointerdown?: (event: Event) => void;
	navDragstart?: (event: Event) => void;
	navDragend?: (event: Event) => void;
	borderPointerdown?: (event: Event) => void;
}

const collectDomGroups = (root: Element): HTMLElement[] => {
	const out: HTMLElement[] = [];
	const walk = (el: Element): void => {
		if (!isGroup(el)) return;
		out.push(el as HTMLElement);
		for (const child of Array.from(el.children)) {
			if (isGroup(child)) walk(child);
		}
	};
	walk(root);
	return out;
};

const collectTreeNodes = (node: LayoutTreeNode): LayoutTreeNode[] => {
	const out: LayoutTreeNode[] = [node];
	if (node.kind === 'split') {
		for (const child of node.children) {
			out.push(...collectTreeNodes(child));
		}
	}
	return out;
};

const isSplitHost = (el: HTMLElement): boolean => Array.from(el.children).some(isGroup);

const hasLeafHosts = (el: HTMLElement): boolean =>
	el.querySelector(`:scope > .${NAV_CLASS}`) !== null &&
	el.querySelector(`:scope > .${MANAGER_CLASS}.group-manager`) !== null;

export async function mountVueGroupTree(
	host: HTMLElement,
	scheme: LayoutSchemeData,
	handlers: VueLeafEventHandlers = {}
): Promise<VueGroupTreeHandle> {
	const tree = parseLayoutScheme(scheme);
	const vnode: VNode = h(LayoutTreeView, { node: tree });
	render(vnode, host);
	await nextTick();

	const root = host.firstElementChild as HTMLElement | null;
	if (root === null || !isGroup(root)) {
		throw new Error('[mountVueGroupTree] LayoutTreeView 未在宿主内渲染出 group 根');
	}

	// DOM 组元素先序序与数据树先序一一对应（每个树节点恰渲染一个 .group）。
	const domGroups = collectDomGroups(root);
	const treeNodes = collectTreeNodes(tree);
	if (domGroups.length !== treeNodes.length) {
		render(null, host);
		throw new Error(
			`[mountVueGroupTree] DOM group 数 ${domGroups.length} 与数据树节点数 ${treeNodes.length} 不一致`
		);
	}

	const leaves: VueLeafHost[] = [];
	for (let i = 0; i < domGroups.length; i++) {
		const el = domGroups[i] as LayoutGroupHost;
		const node = treeNodes[i];
		if (isSplitHost(el)) {
			if (node.kind !== 'split') {
				render(null, host);
				throw new Error('[mountVueGroupTree] 结构分叉：DOM 为 split 而数据为叶子 group');
			}
			el.end = node.end;
			el.split = node.split;
			continue;
		}
		if (node.kind !== 'group') {
			render(null, host);
			throw new Error('[mountVueGroupTree] 结构分叉：DOM 为叶子而数据为 split');
		}
		if (!hasLeafHosts(el)) {
			render(null, host);
			throw new Error('[mountVueGroupTree] 叶子缺 .nav-bar/.page-manager.group-manager 宿主');
		}

		const nav = el.querySelector(`:scope > .${NAV_CLASS}`) as HTMLElement;
		const manager = el.querySelector(
			`:scope > .${MANAGER_CLASS}.group-manager`
		) as PageManagerApi;
		const border = el.querySelector(`:scope > .${BORDER_CLASS}`) as HTMLElement;
		el.end = node.end;
		el.tabs = [...node.tabs];
		el.nav = nav;
		el.manager = manager;
		el.border = border;

		// 与命令式 createGroupContent/createGroupBorder 相同的事件接线
		// （引擎 on() 会走 nav 元素自带的 .on 路由，从而启用 YMNavBar 的 write 派发）。
		if (handlers.navWrite !== undefined) on(nav, 'write', handlers.navWrite);
		if (handlers.navPointerdown !== undefined) on(nav, 'pointerdown', handlers.navPointerdown);
		if (handlers.navDragstart !== undefined) on(nav, 'dragstart', handlers.navDragstart);
		if (handlers.navDragend !== undefined) on(nav, 'dragend', handlers.navDragend);
		if (handlers.borderPointerdown !== undefined) {
			on(border, 'pointerdown', handlers.borderPointerdown);
		}

		leaves.push({ element: el, nav, manager, border, tabs: [...node.tabs] });
	}

	let mounted = true;
	return {
		root,
		leaves,
		unmount: () => {
			if (!mounted) return;
			mounted = false;
			render(null, host);
		}
	};
}
