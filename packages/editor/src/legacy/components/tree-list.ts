import {
	createTreeListApi,
	createTreeListElement,
	treeListPrototype,
	treeListStatics
} from '@ui-kit';
import { Menu } from './menu-list.ts';

const getMenuState = (): string => Menu.state;

interface TreeListStaticsType {
	padding: any;
	createParents: (items: any[], parent: any) => void;
	deleteCaches: (data: any) => void;
	textBox: any;
	prototype: Record<string, (...args: any[]) => any>;
}

export const TreeList: TreeListStaticsType = {
	padding: treeListStatics.padding,
	createParents: treeListStatics.createParents,
	deleteCaches: treeListStatics.deleteCaches,
	textBox: treeListStatics.textBox,
	prototype: treeListPrototype as any
};

export interface TreeListElement extends HTMLElement {
	[k: string]: any;
}

export function attachTreeListApi(el: HTMLElement): void {
	createTreeListApi(el, { getMenuState });
}

export function createTreeList(): TreeListElement {
	const el = createTreeListElement({ getMenuState });
	return el as unknown as TreeListElement;
}
