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
	get textBox() {
		return treeListStatics.textBox;
	},
	prototype: treeListPrototype
};

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
	return el as TreeListElement;
}
