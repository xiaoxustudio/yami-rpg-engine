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

/**
 * **先序全体节点**（容器 + 叶子），与 `parseLayoutScheme` 分配 `layout-N` id 的顺序一致。
 * 结构性 drop 把 DOM 落点（可能是容器）映射回 scheme 节点时用：`ids[k]` ↔ 第 k 个组元素。
 */
export function nodesOf(root: LayoutTreeNode | null): LayoutTreeNode[] {
	if (root === null) return [];
	const nodes: LayoutTreeNode[] = [];
	const walk = (node: LayoutTreeNode): void => {
		nodes.push(node);
		if (node.kind === 'group') return;
		for (const child of node.children) {
			walk(child);
		}
	};
	walk(root);
	return nodes;
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

export function collapseRedundantSplits(root: LayoutTreeNode): LayoutTreeNode {
	const walk = (node: LayoutTreeNode): LayoutTreeNode => {
		if (node.kind === 'group') return node;
		const children = node.children.map(walk);
		if (children.length === 1) return { ...children[0], end: node.end };
		return { ...node, children };
	};
	return walk(root);
}

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

/**
 * 收敛一组兄弟跨度（`end` = 相对父容器的累计结束比例）。
 *
 * 为什么必须有这一步：`Layout.updateGroups` 用 `left = pw*start`、`width = pw*(end-start)`
 * 写内联像素。一旦 `end` 非单调（后一个比前一个小）或不是有限数，写出的就是**负宽 / `NaNpx`**
 * —— 浏览器直接拒收非法内联值，元素于是保留上一次的 `left/width` 或退回静态位置（≈ 左缘 0），
 * 实机表现就是「同层两个组互相压住」。像素口径的间距收敛（`computeSizesBefore/After` 用
 * `min = min(0.1, 32/space)`）在窄容器里正是非单调的一个来源。
 *
 * 规则：严格单调、首个不早于 0、末个不超过 1；间隔取 1px 对应比例（空间不足时不再硬撑，
 * 宁可贴住也不越过后一个兄弟）。非有限值按「贴住前一个」处理。
 *
 * @param ends 各兄弟当前的 end（按 DOM 序）
 * @param space 父容器在分割轴上的像素尺寸（用于把 1px 换算成比例）
 */
export function clampEnds(ends: readonly number[], space: number): number[] {
	const epsilon = space > 0 ? 1 / space : 0;
	const out: number[] = [];
	let prev = 0;
	for (let index = 0; index < ends.length; index++) {
		const raw = ends[index];
		const floor = index === 0 ? 0 : prev + epsilon;
		const value = Number.isFinite(raw) ? raw : floor;
		const end = Math.round(Math.min(Math.max(value, floor), 1) * 1e6) / 1e6;
		out.push(end);
		prev = end;
	}
	return out;
}

export type LayoutDropDirection = 'left' | 'right' | 'top' | 'bottom';

const dropBefore = (direction: LayoutDropDirection): boolean =>
	direction === 'left' || direction === 'top';

const dropAxis = (direction: LayoutDropDirection): LayoutSplitDirection =>
	direction === 'left' || direction === 'right' ? 'horizontal' : 'vertical';

let dropSeq = 0;

/** 往 `children` 里替换/插入，返回新数组（不可变） */
const withChild = (
	children: readonly LayoutTreeNode[],
	index: number,
	node: LayoutTreeNode
): LayoutTreeNode[] => {
	const out = [...children];
	out[index] = node;
	return out;
};

/**
 * 在目标节点旁开一个新叶子（region 边缘 drop）。
 *
 * 与「命令式版」逐条对应：
 * - 目标父容器的轴与本次方向一致 ⇒ 直接插到目标前/后（左/上取目标跨度中点、右/下让目标收缩到中点）；
 * - 轴不同（或目标本身就是根节点）⇒ 先把目标包进一层**同轴**容器：容器继承目标的 end、目标 end 置 1，
 *   新叶子再按方向放进容器（此时跨度是 [0,1]，中点 0.5）。
 *
 * `targetNodeId` 可以是**叶子，也可以是容器**（`regionDragover` 的落点既会给出叶子，
 * 也会给出 `root` / 父容器 / 外层容器——hint 画的是「目标盒子的一半」）。容器落点同样走
 * 「包一层同轴容器」：容器落点若只认叶子，hint 会出现而 drop 静默失效。
 */
const insertLeafBeside = (
	node: LayoutTreeNode,
	targetNodeId: string,
	direction: LayoutDropDirection
): { node: LayoutTreeNode; leaf: LayoutGroupNode } | null => {
	const axis = dropAxis(direction);
	const before = dropBefore(direction);
	const leafId = `drop-leaf-${(dropSeq += 1)}`;
	const leaf = (end: number): LayoutGroupNode => ({
		kind: 'group',
		id: leafId,
		end,
		tabs: [],
		active: null
	});

	if (node.id === targetNodeId) {
		const wrapped: LayoutSplitNode = {
			kind: 'split',
			id: `drop-wrap-${dropSeq}`,
			split: axis,
			end: node.end,
			children: before ? [leaf(0.5), { ...node, end: 1 }] : [{ ...node, end: 0.5 }, leaf(1)]
		};
		return { node: wrapped, leaf: leaf(0.5) };
	}
	if (node.kind === 'group') return null;

	const index = node.children.findIndex(
		(child) => child.kind === 'group' && child.id === targetNodeId
	);
	if (index >= 0) {
		const target = node.children[index] as LayoutGroupNode;
		if (node.split === axis) {
			const prev = index > 0 ? node.children[index - 1] : null;
			const spanStart = prev === null ? 0 : prev.end;
			const spanEnd = target.end;
			const spanMid = (spanStart + spanEnd) / 2;
			if (before) {
				return {
					node: {
						...node,
						children: [
							...node.children.slice(0, index),
							leaf(spanMid),
							...node.children.slice(index)
						]
					},
					leaf: leaf(spanMid)
				};
			}
			const children = withChild(node.children, index, { ...target, end: spanMid });
			children.splice(index + 1, 0, leaf(spanEnd));
			return { node: { ...node, children }, leaf: leaf(spanEnd) };
		}
		const wrapped: LayoutSplitNode = {
			kind: 'split',
			id: `drop-wrap-${dropSeq}`,
			split: axis,
			end: target.end,
			children: before
				? [leaf(0.5), { ...target, end: 1 }]
				: [{ ...target, end: 0.5 }, leaf(1)]
		};
		return {
			node: { ...node, children: withChild(node.children, index, wrapped) },
			leaf: leaf(0.5)
		};
	}

	for (let i = 0; i < node.children.length; i++) {
		const child = node.children[i];
		if (child.kind !== 'split') continue;
		const stepped = insertLeafBeside(child, targetNodeId, direction);
		if (stepped !== null) {
			return {
				node: { ...node, children: withChild(node.children, i, stepped.node) },
				leaf: stepped.leaf
			};
		}
	}
	return null;
};

/**
 * 移除一个叶子，收敛语义与 drop 的现状实现**逐条对应**：
 * 1. 它是父容器的最后一个孩子 ⇒ 前一个兄弟的 end 补到 1（命令式版就是这么填这个缺口的）；
 * 2. 移除后父容器只剩一个孩子 ⇒ 提升它顶替父容器并继承父容器的 end。
 */
const removeLeafForDrop = (root: LayoutTreeNode, leafId: string): LayoutTreeNode | null => {
	const walk = (node: LayoutTreeNode): { node: LayoutTreeNode | null; removed: boolean } => {
		if (node.kind === 'group') {
			return node.id === leafId ? { node: null, removed: true } : { node, removed: false };
		}
		const index = node.children.findIndex(
			(child) => child.kind === 'group' && child.id === leafId
		);
		if (index >= 0) {
			const kept = node.children.filter((_, i) => i !== index);
			if (index === node.children.length - 1 && kept.length !== 0) {
				kept[kept.length - 1] = { ...kept[kept.length - 1], end: 1 };
			}
			if (kept.length === 1) return { node: { ...kept[0], end: node.end }, removed: true };
			if (kept.length === 0) return { node: null, removed: true };
			return { node: { ...node, children: kept }, removed: true };
		}
		for (let i = 0; i < node.children.length; i++) {
			const child = node.children[i];
			if (child.kind !== 'split') continue;
			const result = walk(child);
			if (!result.removed) continue;
			if (result.node === null) {
				const kept = node.children.filter((_, k) => k !== i);
				if (kept.length === 0) return { node: null, removed: true };
				if (kept.length === 1)
					return { node: { ...kept[0], end: node.end }, removed: true };
				return { node: { ...node, children: kept }, removed: true };
			}
			return {
				node: { ...node, children: withChild(node.children, i, result.node) },
				removed: true
			};
		}
		return { node, removed: false };
	};
	return walk(root).node;
};

/**
 * region 边缘 drop 的**纯数据变换**：把 `tab` 从 `fromGroupId` 搬到「贴着 `targetNodeId` 新开的叶子」。
 *
 * `targetNodeId` 是**叶子或容器**（`regionDragover` 的落点两者都可能给）：容器会被包进一层
 * 同轴容器，新叶子取容器跨度的一半（与 hint「目标盒子的一半」一致），源页签直接落进新叶子。
 * 找不到落点时返回 `root`（调用方按 no-op 处理）；源叶子被搬空会导致整棵树消失时返回 `null`。
 */
export function splitGroupWithTab(
	root: LayoutTreeNode,
	targetNodeId: string,
	fromGroupId: string,
	tab: string,
	direction: LayoutDropDirection
): LayoutTreeNode | null {
	const source = findGroup(root, fromGroupId);
	if (source === null || source.tabs.indexOf(tab) === -1) return root;
	const stepped = insertLeafBeside(root, targetNodeId, direction);
	if (stepped === null) return root;
	const leafId = stepped.leaf.id;
	const withTab = moveTabToLeaf(stepped.node, fromGroupId, leafId, tab);
	if (withTab === null) return null;
	return collapseRedundantSplits(withTab);
}

/** 把页签从源叶子搬进目标叶子（源叶子被搬空则按 `removeLeafForDrop` 移除）；树被清空时返回 null */
const moveTabToLeaf = (
	root: LayoutTreeNode,
	fromGroupId: string,
	toGroupId: string,
	tab: string
): LayoutTreeNode | null => {
	const source = findGroup(root, fromGroupId);
	if (source === null || source.tabs.indexOf(tab) === -1) return root;
	const remaining = source.tabs.filter((value) => value !== tab);
	let next: LayoutTreeNode | null;
	if (remaining.length !== 0) {
		next = cloneAncestors(root, fromGroupId, () => ({
			...source,
			tabs: remaining,
			active: source.active === tab ? null : source.active
		}));
	} else {
		next = removeLeafForDrop(root, fromGroupId);
	}
	if (next === null) return null;
	return cloneAncestors(next, toGroupId, (target) => ({
		...target,
		tabs: [...target.tabs, tab],
		active: tab
	}));
};
