import { h, nextTick, render, type VNode } from 'vue';
import { elementDataOf, type PageManagerApi } from '@ui-kit';
import LayoutTreeView from '@app/components/layout/LayoutTreeView.vue';
import { on } from '@app/utils/element-utils';
import { parseLayoutScheme, type LayoutSchemeData, type LayoutTreeNode } from './layout-scheme';

const GROUP_CLASS = 'group';
const NAV_CLASS = 'nav-bar';
const MANAGER_CLASS = 'page-manager';
const BORDER_CLASS = 'group-border';

const isGroup = (el: Element): boolean => el.classList.contains(GROUP_CLASS);

type LayoutGroupHost = HTMLElement & {
	split?: string;
	tabs?: string[];
	nav?: HTMLElement;
	manager?: PageManagerApi;
	border?: HTMLElement;
};

interface LayoutGroupData {
	end: number;
}

const groupData = (el: unknown): LayoutGroupData => elementDataOf<LayoutGroupData>(el);

export interface VueLeafHost {
	element: HTMLElement;
	nav: HTMLElement;
	manager: PageManagerApi;
	border: HTMLElement;
	tabs: string[];
}

export interface VueGroupTreeHandle {
	root: HTMLElement;
	leaves: VueLeafHost[];
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

	const rendered = (vnode.el as HTMLElement | null) ?? null;
	const root =
		rendered !== null && isGroup(rendered)
			? rendered
			: ((host.firstElementChild as HTMLElement | null) ?? null);
	if (root === null || !isGroup(root)) {
		throw new Error('[mountVueGroupTree] LayoutTreeView 未在宿主内渲染出 group 根');
	}

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
			groupData(el).end = node.end;
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
		groupData(el).end = node.end;
		el.tabs = [...node.tabs];
		el.nav = nav;
		el.manager = manager;
		el.border = border;

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
