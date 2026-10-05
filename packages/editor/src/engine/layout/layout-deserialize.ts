// DOM group 树 → 数据树反序列化
// 从宿主 page-frame 内的 group DOM 读回 layout-scheme 数据模型：
// kind/split 以 group 元素 expando `split` 为准；叶子 tabs 读 expando `tabs`，
// active 读 `manager.index`（无/undefined 归一为 null）；id 按先序分配。

import { elementDataOf } from '@ui-kit';
import type { LayoutGroupNode, LayoutSplitDirection, LayoutTreeNode } from './layout-scheme';

const SPLIT_DIRECTIONS = ['horizontal', 'vertical'] as const;

type ManagerShape = HTMLElement & { index?: string | null };

type GroupShape = HTMLElement & {
	tabs?: string[];
	nav?: HTMLElement;
	manager?: ManagerShape;
};

// `end` 是元素数据（原型访问器已退役），不再是元素自身属性
interface GroupElementData {
	end?: number;
}

const groupData = (el: unknown): GroupElementData => elementDataOf<GroupElementData>(el);

const isGroup = (el: Element): boolean => el.classList.contains('group');

const splitOf = (group: GroupShape): LayoutSplitDirection | undefined => {
	const split = (group as HTMLElement & { split?: unknown }).split;
	return SPLIT_DIRECTIONS.includes(split as LayoutSplitDirection)
		? (split as LayoutSplitDirection)
		: undefined;
};

const endOf = (group: GroupShape): number => {
	const { end } = groupData(group);
	return typeof end === 'number' && Number.isFinite(end) ? end : 1;
};

const tabsOf = (group: GroupShape): string[] => {
	if (Array.isArray(group.tabs)) return [...group.tabs];
	const nav = group.nav;
	if (nav === undefined) return [];
	return Array.from(nav.children)
		.filter((child) => child.classList.contains('nav-item'))
		.map((child) => child.getAttribute('value') ?? '')
		.filter((value) => value !== '');
};

const activeOf = (group: GroupShape): string | null => {
	const index = group.manager?.index;
	return typeof index === 'string' ? index : null;
};

export function deserializeGroupElement(group: Element): LayoutTreeNode {
	let seq = 0;
	const build = (element: Element): LayoutTreeNode => {
		const current = element as GroupShape;
		const id = `layout-${++seq}`;
		const end = endOf(current);
		const split = splitOf(current);
		if (split !== undefined) {
			const children = Array.from(current.children)
				.filter((child) => isGroup(child))
				.map(build);
			return { kind: 'split', id, split, end, children };
		}
		return {
			kind: 'group',
			id,
			end,
			tabs: tabsOf(current),
			active: activeOf(current)
		} satisfies LayoutGroupNode;
	};
	return build(group);
}

/**
 * **先序节点元素表**：与 `deserializeGroupElement` 的 id 分配（`layout-1`…`layout-N`）严格同序，
 * 供结构性 drop 把落点元素映射回 scheme 节点 —— 落点既可能是叶子，也可能是容器
 * （`regionDragover` 会给出 `root` / 父容器 / 外层容器）。
 *
 * ⚠️ 判据必须与上面的 `build` 完全一致：`split` expando 判容器（轴非法按叶子处理），
 * 否则两边的先序序会错位，drop 会落到错误的节点上。
 */
export function groupTreeElements(group: Element): Element[] {
	const elements: Element[] = [];
	const walk = (element: Element): void => {
		elements.push(element);
		if (splitOf(element as GroupShape) === undefined) return;
		for (const child of Array.from(element.children)) {
			if (isGroup(child)) walk(child);
		}
	};
	walk(group);
	return elements;
}

// 宿主 page-frame 的第一个子节点若是 group 树则反序列化，否则返回 null。
// 对应 home / 未物化工作区 / 无 scheme 页。
export function deserializePage(page: Element): LayoutTreeNode | null {
	const root = Array.from(page.children).find((child) => isGroup(child));
	return root === undefined ? null : deserializeGroupElement(root);
}
