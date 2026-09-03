// 布局树数据模型与不可变变换（docs/layout-vue-plan.md M2 数据层）
// 纯数据、无 DOM：把 docking scheme 解析为带稳定 id 的树；激活/移动页签走不可变更新，
// 源组清空时按现状 DOM 折叠语义（空 split 删除、单子组提升并继承父 end）收敛结构。

export type LayoutSplitDirection = 'horizontal' | 'vertical';

export interface LayoutSplitNode {
	readonly kind: 'split';
	readonly id: string;
	readonly split: LayoutSplitDirection;
	readonly end: number;
	readonly children: readonly LayoutTreeNode[];
}

export interface LayoutGroupNode {
	readonly kind: 'group';
	readonly id: string;
	readonly end: number;
	readonly tabs: readonly string[];
	readonly active: string | null;
}

export type LayoutTreeNode = LayoutSplitNode | LayoutGroupNode;

export interface LayoutSchemeData {
	end: number;
	split?: LayoutSplitDirection;
	children?: LayoutSchemeData[];
	tabs?: string[];
	[key: string]: unknown;
}

const isSplitDirection = (value: unknown): value is LayoutSplitDirection =>
	value === 'horizontal' || value === 'vertical';

const asEnd = (value: unknown): number =>
	typeof value === 'number' && Number.isFinite(value) ? value : 1;

const asSplitDirection = (value: unknown): LayoutSplitDirection | undefined =>
	isSplitDirection(value) ? value : undefined;

const asTabs = (value: unknown): string[] =>
	Array.isArray(value) ? value.filter((tab): tab is string => typeof tab === 'string') : [];

const asSchemeChildren = (value: unknown): LayoutSchemeData[] =>
	Array.isArray(value) ? (value as LayoutSchemeData[]) : [];

export function parseLayoutScheme(scheme: LayoutSchemeData): LayoutTreeNode {
	let seq = 0;
	const build = (data: LayoutSchemeData): LayoutTreeNode => {
		const id = `layout-${++seq}`;
		const end = asEnd(data.end);
		const split = asSplitDirection(data.split);
		const children = asSchemeChildren(data.children);
		if (split !== undefined || children.length !== 0) {
			return {
				kind: 'split',
				id,
				split: split ?? 'horizontal',
				end,
				children: children.map(build)
			};
		}
		return { kind: 'group', id, end, tabs: asTabs(data.tabs), active: null };
	};
	return build(scheme);
}

export function toLayoutScheme(root: LayoutTreeNode): LayoutSchemeData {
	if (root.kind === 'group') {
		return { end: root.end, tabs: [...root.tabs] };
	}
	return {
		end: root.end,
		split: root.split,
		children: root.children.map(toLayoutScheme)
	};
}

export function leavesOf(root: LayoutTreeNode | null): LayoutGroupNode[] {
	if (root === null) return [];
	const leaves: LayoutGroupNode[] = [];
	const walk = (node: LayoutTreeNode): void => {
		if (node.kind === 'group') {
			leaves.push(node);
			return;
		}
		for (const child of node.children) {
			walk(child);
		}
	};
	walk(root);
	return leaves;
}

export function findGroup(root: LayoutTreeNode | null, groupId: string): LayoutGroupNode | null {
	return leavesOf(root).find((leaf) => leaf.id === groupId) ?? null;
}

const cloneAncestors = (
	root: LayoutTreeNode,
	groupId: string,
	update: (group: LayoutGroupNode) => LayoutGroupNode
): LayoutTreeNode => {
	const walk = (node: LayoutTreeNode): LayoutTreeNode => {
		if (node.kind === 'group') {
			return node.id === groupId ? update(node) : node;
		}
		let changed = false;
		const children = node.children.map((child) => {
			const next = walk(child);
			if (next !== child) changed = true;
			return next;
		});
		return changed ? { ...node, children } : node;
	};
	return walk(root);
};

export function activateLayoutTab(
	root: LayoutTreeNode,
	groupId: string,
	tab: string
): LayoutTreeNode {
	if (findGroup(root, groupId)?.tabs.indexOf(tab) === -1) return root;
	return cloneAncestors(root, groupId, (group) =>
		group.active === tab ? group : { ...group, active: tab }
	);
}

export function groupActiveTab(group: LayoutGroupNode): string | null {
	return group.active;
}

// 移除一个叶子组；空 split 删除、单子组提升并继承父 end，与现状 navDrop 折叠语义对齐。
// 整棵树被清空时返回 null。
function removeGroupNode(root: LayoutTreeNode, groupId: string): LayoutTreeNode | null {
	const walk = (node: LayoutTreeNode): { root: LayoutTreeNode | null; removed: boolean } => {
		if (node.kind === 'group') {
			return node.id === groupId
				? { root: null, removed: true }
				: { root: node, removed: false };
		}
		const kept: LayoutTreeNode[] = [];
		let removed = false;
		for (const child of node.children) {
			const result = walk(child);
			if (result.removed) {
				removed = true;
				if (result.root !== null) kept.push(result.root);
			} else {
				kept.push(child);
			}
		}
		if (!removed) return { root: node, removed: false };
		if (kept.length === 1) {
			return { root: { ...kept[0], end: node.end }, removed: true };
		}
		if (kept.length === 0) return { root: null, removed: true };
		return { root: { ...node, children: kept }, removed: true };
	};
	return walk(root).root;
}

const removeTab = (root: LayoutTreeNode, groupId: string, tab: string): LayoutTreeNode | null => {
	const group = findGroup(root, groupId);
	if (group === null) return root;
	const index = group.tabs.indexOf(tab);
	if (index === -1) return root;
	const tabs = group.tabs.filter((value) => value !== tab);
	if (tabs.length !== 0) {
		return cloneAncestors(root, groupId, () => ({
			...group,
			tabs,
			active: group.active === tab ? null : group.active
		}));
	}
	return removeGroupNode(root, groupId);
};

const insertTab = (tabs: readonly string[], tab: string, index: number): string[] => {
	const out = [...tabs];
	const position = Math.max(0, Math.min(index, out.length));
	out.splice(position, 0, tab);
	return out;
};

export function moveLayoutTab(
	root: LayoutTreeNode,
	fromGroupId: string,
	toGroupId: string,
	tab: string,
	toIndex: number
): LayoutTreeNode | null {
	const source = findGroup(root, fromGroupId);
	if (source === null || source.tabs.indexOf(tab) === -1) return root;
	const keepActiveOnSelfMove = fromGroupId === toGroupId && source.active === tab;
	const afterRemove = removeTab(root, fromGroupId, tab);
	if (afterRemove === null) return null;
	const target = findGroup(afterRemove, toGroupId);
	if (target === null) return afterRemove;
	return cloneAncestors(afterRemove, toGroupId, () => ({
		...target,
		tabs: insertTab(target.tabs, tab, toIndex),
		active: keepActiveOnSelfMove ? tab : target.active
	}));
}
