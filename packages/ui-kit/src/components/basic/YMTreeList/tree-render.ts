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
import { elementDataOf } from '../../../utils/element-data';

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
	/** key → 当前派生行（绑定回写 expando 字段用） */
	rowData: Map<string, TreeRenderRow>;
	/** 消费方覆盖的显示文本（parseName 之外，供 setItemText 使用） */
	textOverrides: WeakMap<TreeItem, string>;
	/** 本 state 所属的列表元素（消费方按 item 反查 list） */
	owner: unknown;
	keyMap: WeakMap<TreeItem, string>;
	bump: () => void;
}

/** item → 所属 state（flattenRows 时登记，窗口外 item 亦可反查） */
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

/** 覆盖行显示文本（parseName 之外；窗口外行同样生效，无需 element 存在） */
export const setItemText = (state: TreeRenderState, item: TreeItem, text: string): void => {
	if (state.textOverrides.get(item) === text) return;
	state.textOverrides.set(item, text);
	// 仅 bump：组件侧 windowRows 依赖 version 合成显示文本（无需整体重派生）
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
	/** 顶层项的 parent（legacy 为合成 root：children getter 指向 data） */
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
		// 与 legacy updateNodeElement 等价：children 为数组时 markIndent=0（空数组亦占位）
		const markIndent = hasChildrenMark ? 0 : foldable ? 16 : 0;
		// 消费方按 item 反查 list（含窗口外 item）：派生期登记归属
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
		element.item = item;
		element.changed = false;
		const folderMark = element.querySelector(':scope > .folder-mark') as HTMLElement | null;
		const nodeIcon = element.querySelector(
			':scope > .node-icon, :scope > .tree-node-icon'
		) as HTMLElement | null;
		const extras = element.querySelector(':scope > .tree-node-extras') as HTMLElement | null;
		const textHost = element.querySelector(':scope > .node-text') as HTMLElement | null;
		// P4b：行元素上的这几个字段改成显式元素数据（`folderMark`/`markVisible` 已从 DATA_FIELDS 摘除）
		const data = elementDataOf<NodeElement>(element);
		data.folderMark = folderMark;
		data.nodeIcon = nodeIcon as HTMLElement;
		element.extras = extras;
		data.textNode = (textHost?.firstChild ?? null) as Text | null;
		// expando 字段与派生行对齐（旧实现里这些字段是渲染期的值缓存，消费方/测试会读）
		const row = state.rowData.get(key);
		if (row !== undefined) {
			element.indent = row.indent;
			element.textIndent = row.textIndent;
			element.markIndent = row.textIndent - row.indent * 12;
			data.markVisible = row.markVisible;
			element.expanded = row.expanded;
		} else {
			element.indent = 0;
			element.textIndent = 0;
			element.markIndent = folderMark === null ? 16 : 0;
			data.markVisible = folderMark !== null;
			element.expanded = false;
		}
		state.rowElements.set(key, element);
		return;
	}
	// 行被移除（折叠/移出窗口/删节点/卸载）：ref 回调收到 null 即代表该行已卸载
	state.rowElements.delete(key);
};
