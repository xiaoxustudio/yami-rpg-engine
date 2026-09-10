import {
	createTreeListApi,
	createTreeListElement,
	treeListPrototype,
	treeListStatics
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
	textBox: treeListStatics.textBox,
	prototype: treeListPrototype
};

export interface TreeListElement extends HTMLElement {
	// oxlint-disable-next-line no-explicit-any
	[k: string]: any;
}

export function attachTreeListApi(el: HTMLElement): void {
	createTreeListApi(el, { getMenuState });
}

export function createTreeList(): TreeListElement {
	const el = createTreeListElement({ getMenuState });
	return el as unknown as TreeListElement;
}
