// 布局树数据模型与不可变变换（layout 迁移规划 M2 数据层）
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

// M4-2（layout 迁移规划 M4）：规整冗余容器。
// Teleport 组树不渲染容器 border，命令式「源组搬空折叠」后容器可能只剩单个子组
// （命令式模式的 flatten 依赖 border 子节点计数），此处按同一收敛语义提升单子组并继承父 end。
export function collapseRedundantSplits(root: LayoutTreeNode): LayoutTreeNode {
	const walk = (node: LayoutTreeNode): LayoutTreeNode => {
		if (node.kind === 'group') return node;
		const children = node.children.map(walk);
		if (children.length === 1) return { ...children[0], end: node.end };
		return { ...node, children };
	};
	return walk(root);
}

// M4（layout 迁移规划 M4）：同组内页签顺序移动（数据先行）。
// 与现状 navDrop 的 DOM 语义等价：先移除该页签，anchor=null 视为 append 到末尾，
// 否则插到 anchor 页签（移除后）所在位置之前；anchor 不存在时回退 append。
// 纯函数、无 DOM，供引擎层以 tabs 数据驱动 DOM 收敛（取代命令式 insertBefore 差量）。
export function moveTabWithin(
	tabs: readonly string[],
	tab: string,
	anchor: string | null
): string[] {
	if (tabs.indexOf(tab) === -1) return [...tabs];
	const rest = tabs.filter((value) => value !== tab);
	if (anchor === null) return [...rest, tab];
	const index = rest.indexOf(anchor);
	if (index === -1) return [...rest, tab];
	const out = [...rest];
	out.splice(index, 0, tab);
	return out;
}
