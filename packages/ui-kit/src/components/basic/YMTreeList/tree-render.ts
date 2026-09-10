// YMTreeList 行渲染数据层（docs/tree-list-vfor-plan.md 步骤 2，方案 B）
// 目标：把「命令式 createNodeElement/appendChild 差量」换成「数据派生 + v-for」，
// 同时保持对外契约（update/select/read/drop/... 与 item.element 缓存）零改动。
//
// 关键设计：
// - renderVersion 版本号驱动：所有结构变更最终汇聚到 update()，bump 即触发重算；
// - rows = 扁平化派生（normal 递归展开 / search 平铺），windowRows = 滚动窗口切片；
// - key 用 WeakMap 发号（不能直接用 item.id：script/event list 允许重复 id），
//   同一 item 在多次 flatten 之间 key 稳定 → Vue 只移动/复用行，item.element 引用稳定；
// - itemClasses 注册表：消费方命令式加的 class 并入绑定值，避免被 Vue class patch 抹掉。

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

export const ROW_HEIGHT = 20;

export interface TreeRenderRow {
	key: string;
	item: TreeItem;
	indent: number;
	/** markIndent + indent * 12 */
	textIndent: number;
	/** 是否显示折叠标记（children 为非空数组） */
	markVisible: boolean;
	/** children 为数组即渲染折叠标记容器（空数组时 legacy 用 visibility:hidden 占位） */
	hasChildrenMark: boolean;
	expanded: boolean;
	name: string;
	/** 默认图标类（未提供 renderNodeIcon 时）；提供时由 .tree-node-icon 容器承载 */
	iconClass: string[];
	/** 运行时受控 class（选中/拖拽提示由 state 提供，业务 class 走 itemClasses） */
	selected: boolean;
	hint: boolean;
	extraClasses: string[];
}

export interface TreeRenderState {
	version: ShallowRef<number>;
	rows: ShallowRef<TreeRenderRow[]>;
	start: Ref<number>;
	end: Ref<number>;
	/** 行元素绑定（:ref 回调）后由引擎回写 */
	itemClasses: WeakMap<TreeItem, Set<string>>;
	rowElements: Map<string, NodeElement>;
	keyMap: WeakMap<TreeItem, string>;
	bump: () => void;
}

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

export const createTreeRenderState = (): TreeRenderState => {
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
		keyMap: rowKeys,
		bump: () => {
			version.value += 1;
			triggerRef(rows);
		}
	};
};

export const setItemClass = (
	state: TreeRenderState,
	item: TreeItem,
	className: string,
	on = true
): void => {
	let set = state.itemClasses.get(item);
	if (set === undefined) {
		set = new Set<string>();
		state.itemClasses.set(item, set);
	}
	if (on) set.add(className);
	else set.delete(className);
	state.bump();
};

export const itemClassesOf = (state: TreeRenderState, item: TreeItem): string[] => {
	const set = state.itemClasses.get(item);
	return set === undefined ? [] : Array.from(set);
};

interface FlattenOptions {
	display: string;
	data: TreeItem[] | null;
	searchResults: TreeItem[];
	foldable: boolean;
	parseName: (item: TreeItem) => string;
	selections: TreeItem[];
	hintItem: TreeItem | null;
}

/** 行派生：与旧 createIndentedItems/createFlatItems 逐点等价（含 parent 链与 childNoParent 防御） */
export const flattenRows = (state: TreeRenderState, options: FlattenOptions): TreeRenderRow[] => {
	const { display, data, searchResults, foldable, parseName, selections, hintItem } = options;
	const out: TreeRenderRow[] = [];
	const selectedSet = new Set<TreeItem>(selections);
	const push = (item: TreeItem, indent: number): void => {
		const hasChildrenMark = item.children instanceof Array;
		const markVisible = hasChildrenMark && item.children!.length !== 0;
		// 与 legacy updateNodeElement 等价：children 为数组时 markIndent=0（空数组亦占位）
		const markIndent = hasChildrenMark ? 0 : foldable ? 16 : 0;
		out.push({
			key: rowKeyOf(item),
			item,
			indent,
			textIndent: markIndent + indent * 12,
			markVisible,
			hasChildrenMark,
			expanded: markVisible && item.expanded === true,
			name: parseName(item),
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
		walk(data, null, 0);
	}
	return out;
};

/** 虚拟滚动窗口：与 common-list 现行公式一致（20px 行高，窗口 = ceil(ch/20)+1） */
export const computeWindow = (
	scrollTop: number,
	clientHeight: number,
	count: number
): { start: number; end: number } => {
	if (clientHeight === 0 || count === 0) return { start: 0, end: 0 };
	const start = Math.min(Math.floor(scrollTop / ROW_HEIGHT), count - 1);
	const length = Math.ceil(clientHeight / ROW_HEIGHT) + 1;
	return { start, end: Math.min(start + length, count) };
};

export const windowRowsOf = (state: TreeRenderState): ComputedRef<TreeRenderRow[]> =>
	computed(() => state.rows.value.slice(state.start.value, state.end.value));

/** 行元素绑定：维护 item.element 桥 + 内部字段（textNode/folderMark/nodeIcon/extras） */
export const bindRowElement = (state: TreeRenderState, item: TreeItem, el: unknown): void => {
	const key = rowKeyOf(item);
	if (el instanceof HTMLElement) {
		const element = el as NodeElement;
		if (item.element !== element) {
			Object.defineProperty(item, 'element', { configurable: true, value: element });
		}
		element.item = item;
		element.indent = 0;
		element.changed = false;
		const folderMark = element.querySelector(':scope > .folder-mark') as HTMLElement | null;
		const nodeIcon = element.querySelector(
			':scope > .node-icon, :scope > .tree-node-icon'
		) as HTMLElement | null;
		const extras = element.querySelector(':scope > .tree-node-extras') as HTMLElement | null;
		const textHost = element.querySelector(':scope > .node-text') as HTMLElement | null;
		element.folderMark = folderMark;
		element.nodeIcon = nodeIcon as HTMLElement;
		element.extras = extras;
		element.textNode = (textHost?.firstChild ?? null) as Text | null;
		element.markVisible = folderMark !== null;
		element.markIndent = folderMark === null ? 16 : 0;
		element.textIndent = 0;
		element.expanded = false;
		state.rowElements.set(key, element);
		return;
	}
	// 行被移除（折叠/移出窗口/删节点）
	const current = state.rowElements.get(key);
	if (current !== undefined && !current.isConnected) {
		state.rowElements.delete(key);
		if (item.element === current) {
			delete item.element;
		}
	}
};
