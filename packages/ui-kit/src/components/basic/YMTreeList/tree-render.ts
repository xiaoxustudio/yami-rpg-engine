import {
	computed,
	ref,
	shallowRef,
	triggerRef,
	type ComputedRef,
	type Ref,
	type ShallowRef
} from 'vue';
import type { NodeElement, TreeItem } from './tree-core';
import { elementDataOf } from '../../../utils/element-data';
import { ROW_HEIGHT, computeVisibleRange } from '../../../utils/common-list';

export { ROW_HEIGHT };

export interface TreeRenderRow {
	key: string;
	item: TreeItem;
	indent: number;
	textIndent: number;
	markVisible: boolean;
	hasChildrenMark: boolean;
	expanded: boolean;
	name: string;
	iconClass: string[];
	selected: boolean;
	hint: boolean;
	extraClasses: string[];
}

export interface TreeRenderState {
	version: ShallowRef<number>;
	rows: ShallowRef<TreeRenderRow[]>;
	start: Ref<number>;
	end: Ref<number>;
	itemClasses: WeakMap<TreeItem, Set<string>>;
	rowElements: Map<string, NodeElement>;
	rowData: Map<string, TreeRenderRow>;
	textOverrides: WeakMap<TreeItem, string>;
	owner: unknown;
	keyMap: WeakMap<TreeItem, string>;
	bump: () => void;
}

const itemOwners = new WeakMap<TreeItem, TreeRenderState>();

export const stateOfItem = (item: TreeItem): TreeRenderState | undefined => itemOwners.get(item);

const rowKeys = new WeakMap<TreeItem, string>();
let rowKeySeq = 0;
export const rowKeyOf = (item: TreeItem): string => {
	let key = rowKeys.get(item);
	if (key === undefined) {
		key = `n${++rowKeySeq}`;
		rowKeys.set(item, key);
	}
	return key;
};

export const createTreeRenderState = (owner?: unknown): TreeRenderState => {
	const version = shallowRef(0);
	const rows = shallowRef<TreeRenderRow[]>([]);
	const start = ref(0);
	const end = ref(0);
	return {
		version,
		rows,
		start,
		end,
		itemClasses: new WeakMap<TreeItem, Set<string>>(),
		rowElements: new Map<string, NodeElement>(),
		rowData: new Map<string, TreeRenderRow>(),
		textOverrides: new WeakMap<TreeItem, string>(),
		owner,
		keyMap: rowKeys,
		bump: () => {
			version.value += 1;
			triggerRef(rows);
		}
	};
};

/**
 * 注册/取消行 class。
 *
 * **幂等**：取值没有真正变化时不 `bump()`（与 `setItemText` 的守卫同一不变式）。
 * 这不是优化而是正确性：`bump()` 会让 `version` 自增，而 `YMTreeList` 的渲染 effect
 * 正好依赖它；消费方在更新路径里注册 class（`onUpdated → applyRowUpdaters →
 * updater / updateNodeElement`，如 text-tip / command-tip）时，无条件 bump 等于在同一个
 * flush 里反复排队自己，Vue 随即报
 * `Maximum recursive updates exceeded in component <YMTreeList>`（实测 101 次后中止渲染）。
 */
export const setItemClass = (
	state: TreeRenderState,
	item: TreeItem,
	className: string,
	on = true
): void => {
	const set = state.itemClasses.get(item);
	if (set === undefined) {
		if (!on) return;
		state.itemClasses.set(item, new Set<string>([className]));
		state.bump();
		return;
	}
	if (on) {
		if (set.has(className)) return;
		set.add(className);
	} else if (!set.delete(className)) {
		return;
	}
	state.bump();
};

export const itemClassesOf = (state: TreeRenderState, item: TreeItem): string[] => {
	const set = state.itemClasses.get(item);
	return set === undefined ? [] : Array.from(set);
};

/** 覆盖行显示文本（parseName 之外；窗口外行同样生效，无需 element 存在） */
export const setItemText = (state: TreeRenderState, item: TreeItem, text: string): void => {
	if (state.textOverrides.get(item) === text) return;
	state.textOverrides.set(item, text);
	state.bump();
};

/** 清除显示文本覆盖，回到 parseName 派生 */
export const clearItemText = (state: TreeRenderState, item: TreeItem): void => {
	if (state.textOverrides.delete(item)) state.bump();
};

/** 该行当前是否已物化（在虚拟窗口内渲染） */
export const isItemRendered = (state: TreeRenderState, item: TreeItem): boolean =>
	state.rowElements.has(rowKeyOf(item));

interface FlattenOptions {
	display: string;
	data: TreeItem[] | null;
	searchResults: TreeItem[];
	foldable: boolean;
	parseName: (item: TreeItem) => string;
	selections: TreeItem[];
	hintItem: TreeItem | null;
	root: TreeItem | null;
}

/** 行派生：与旧 createIndentedItems/createFlatItems 逐点等价（含 parent 链与 childNoParent 防御） */
export const flattenRows = (state: TreeRenderState, options: FlattenOptions): TreeRenderRow[] => {
	const { display, data, searchResults, foldable, parseName, selections, hintItem, root } =
		options;
	const out: TreeRenderRow[] = [];
	const selectedSet = new Set<TreeItem>(selections);
	const push = (item: TreeItem, indent: number): void => {
		const hasChildrenMark = item.children instanceof Array;
		const markVisible = hasChildrenMark && item.children!.length !== 0;
		const markIndent = hasChildrenMark ? 0 : foldable ? 16 : 0;
		itemOwners.set(item, state);
		out.push({
			key: rowKeyOf(item),
			item,
			indent,
			textIndent: markIndent + indent * 12,
			markVisible,
			hasChildrenMark,
			expanded: markVisible && item.expanded === true,
			name: state.textOverrides.get(item) ?? parseName(item),
			iconClass: ['node-icon', item.class === 'folder' ? 'icon-folder' : 'icon-file'],
			selected: selectedSet.has(item),
			hint: hintItem === item,
			extraClasses: itemClassesOf(state, item)
		});
	};
	const walk = (items: TreeItem[], parent: TreeItem | null, indent: number): void => {
		for (const item of items) {
			push(item, indent);
			if (item.parent === undefined) {
				throw new Error('No parent!');
			}
			item.parent = parent;
			if (item.expanded && item.children !== undefined && item.children.length !== 0) {
				walk(item.children, item, indent + 1);
			}
		}
	};
	if (display === 'search') {
		for (const item of searchResults) push(item, 0);
	} else if (data !== null) {
		walk(data, root, 0);
	}
	state.rowData.clear();
	for (const row of out) state.rowData.set(row.key, row);
	return out;
};

/** 虚拟滚动窗口：公式来自 `utils/common-list.ts` 的唯一一份，这里只加树自己的空情形守卫 */
export const computeWindow = (
	scrollTop: number,
	clientHeight: number,
	count: number
): { start: number; end: number } => {
	if (clientHeight === 0 || count === 0) return { start: 0, end: 0 };
	return computeVisibleRange(scrollTop, clientHeight, count);
};

export const windowRowsOf = (state: TreeRenderState): ComputedRef<TreeRenderRow[]> =>
	computed(() => state.rows.value.slice(state.start.value, state.end.value));

/** item → 当前已物化的行元素（未物化 / 已卸载返回 undefined）——替代旧的 `item.element` 桥 */
export const rowElementOf = (item: TreeItem): NodeElement | undefined => {
	const state = stateOfItem(item);
	if (state === undefined) return undefined;
	return state.rowElements.get(rowKeyOf(item));
};

/** 行元素绑定：维护行元素上的内部字段（textNode/folderMark/nodeIcon/extras）与反查指针 */
export const bindRowElement = (state: TreeRenderState, item: TreeItem, el: unknown): void => {
	const key = rowKeyOf(item);
	if (el instanceof HTMLElement) {
		const element = el as NodeElement;
		const data = elementDataOf<NodeElement>(element);
		data.item = item;
		data.changed = false;
		const folderMark = element.querySelector(':scope > .folder-mark') as HTMLElement | null;
		const nodeIcon = element.querySelector(
			':scope > .node-icon, :scope > .tree-node-icon'
		) as HTMLElement | null;
		const extras = element.querySelector(':scope > .tree-node-extras') as HTMLElement | null;
		const textHost = element.querySelector(':scope > .node-text') as HTMLElement | null;
		data.folderMark = folderMark;
		data.nodeIcon = nodeIcon as HTMLElement;
		element.extras = extras;
		data.textNode = (textHost?.firstChild ?? null) as Text | null;
		const row = state.rowData.get(key);
		if (row !== undefined) {
			data.indent = row.indent;
			element.textIndent = row.textIndent;
			element.markIndent = row.textIndent - row.indent * 12;
			data.markVisible = row.markVisible;
			data.expanded = row.expanded;
		} else {
			data.indent = 0;
			element.textIndent = 0;
			element.markIndent = folderMark === null ? 16 : 0;
			data.markVisible = folderMark !== null;
			data.expanded = false;
		}
		state.rowElements.set(key, element);
		return;
	}
	state.rowElements.delete(key);
};
