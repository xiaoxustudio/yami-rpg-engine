import {
	createTreeListApi,
	createTreeListElement,
	treeListPrototype,
	treeListStatics,
	type TreeListElementApi
} from '@ui-kit';
import { Menu } from './menu-list.ts';

const getMenuState = (): string => Menu.state;

interface TreeListStaticsType {
	createParents: typeof treeListStatics.createParents;
	deleteCaches: typeof treeListStatics.deleteCaches;
	textBox: HTMLElement & { input: HTMLInputElement };
	// oxlint-disable-next-line no-explicit-any
	prototype: Record<string, (...args: any[]) => any>;
}

export const TreeList: TreeListStaticsType = {
	createParents: treeListStatics.createParents,
	deleteCaches: treeListStatics.deleteCaches,
	// ui-kit 侧的 `textBox` 现在是惰性 getter（首次访问才建 DOM）。这里若照旧直接求值，
	// 就会在模块加载期把它触发掉，等于白改 —— 所以原样转发成 getter。
	get textBox() {
		return treeListStatics.textBox;
	},
	prototype: treeListPrototype
};

/**
 * 列表元素类型 = 元素 + **ui-kit 的元素 API 契约** + 编辑器自己补挂的成员。
 *
 * **P2b-1（2026-09-17 收口）**：这里过去是
 *
 * ```ts
 * interface TreeListElement extends HTMLElement {
 * 	[k: string]: any;
 * }
 * ```
 *
 * ——一个**逃生口**：任何方法名（写错也算）、任何根本不存在的成员都能通过编译，于是"元素上有
 * 哪些方法"这件事在编辑器侧**完全没有类型约束**（P2b-1 的验收曾是"每个被鸭子调用的组件都有
 * 消费方可直接 import 的 `XxxApi`"，tree 这一处一直名不副实：ui-kit 只导出**行** API
 * `TreeListRowApi`，没有列表级的接口）。
 *
 * 现在改成**实名契约**（与命令列表的 `EventCommandListShape` 派生于 `CommandListElementApi`
 * 是同一手法）：`HTMLElement & TreeListElementApi & { … }`。代价实测只有 3 个成员
 * （`display` / `deleteNode` / 编辑器自补的 `createString`），不再靠 `any` 兜。
 */
export type TreeListElement = HTMLElement &
	TreeListElementApi & {
		/** 枚举窗口自己补挂的工厂：新建一个"字符串"节点（ui-kit 侧只有 `createText`/`createIcon`） */
		createString(): unknown;
	};

export function attachTreeListApi(el: HTMLElement): void {
	createTreeListApi(el, { getMenuState });
}

export function createTreeList(): TreeListElement {
	const el = createTreeListElement({ getMenuState });
	return el as unknown as TreeListElement;
}
