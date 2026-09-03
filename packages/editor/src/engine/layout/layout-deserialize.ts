// DOM group 树 → 数据树反序列化（docs/layout-vue-plan.md M2b / 附录 D 契约）
// 从宿主 page-frame 内的命令式 group DOM 读回 layout-scheme 数据模型：
// kind/split 以 group 元素 expando `split` 为准；叶子 tabs 读 expando `tabs`，
// active 读 `manager.index`（无/undefined 归一为 null）；id 按先序分配。

import type { LayoutGroupNode, LayoutSplitDirection, LayoutTreeNode } from './layout-scheme';

const SPLIT_DIRECTIONS = ['horizontal', 'vertical'] as const;

type ManagerShape = HTMLElement & { index?: string | null };

type GroupShape = HTMLElement & {
	end?: number;
	tabs?: string[];
	nav?: HTMLElement;
	manager?: ManagerShape;
};

const isGroup = (el: Element): boolean => el.classList.contains('group');

const splitOf = (group: GroupShape): LayoutSplitDirection | undefined => {
	const split = (group as HTMLElement & { split?: unknown }).split;
	return SPLIT_DIRECTIONS.includes(split as LayoutSplitDirection)
		? (split as LayoutSplitDirection)
		: undefined;
};

const endOf = (group: GroupShape): number =>
	typeof group.end === 'number' && Number.isFinite(group.end) ? group.end : 1;

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

// 宿主 page-frame 的第一个子节点若是 group 树则反序列化，否则返回 null。
// 对应 home / 未物化工作区 / 无 scheme 页（附录 D D.1）。
export function deserializePage(page: Element): LayoutTreeNode | null {
	const root = Array.from(page.children).find((child) => isGroup(child));
	return root === undefined ? null : deserializeGroupElement(root);
}
