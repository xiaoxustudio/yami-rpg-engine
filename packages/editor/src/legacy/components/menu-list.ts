import { createMenuApi, type MenuApi, type MenuItem, type MenuOptions } from '@ui-kit';

interface MenuListElement extends HTMLElement {
	state: string;
	callback: (() => void) | null;
	dataItems: MenuItem[] | null;
	selection: HTMLElement | null;
	popupTimer: any;
	closeTimer: any;
	parent: MenuApi | null;
	submenu: MenuApi | null;
	buttonPressed: boolean;
	minWidth: number;
	parentMenuItem: HTMLElement | null;
	popup(options: MenuOptions, items: MenuItem[]): void;
	computeMenuWidth(): void;
	close(...args: unknown[]): any;
	clear(...args: unknown[]): any;
	createItem(...args: unknown[]): any;
	select(...args: unknown[]): any;
	unselect(...args: unknown[]): any;
	reselect(offset: number): void;
	popupSubmenu(delay: number): void;
	closeSubmenu(delay: number): void;
	pointerenter(event: any): void;
}

export function attachMenuListApi(el: HTMLElement): void {
	const menu = createMenuApi(el);
	const box = el as unknown as MenuListElement;
	box.popup = menu.popup;
	box.computeMenuWidth = menu.computeMenuWidth;
	box.close = menu.close;
	box.clear = menu.clear;
	box.createItem = menu.createItem as unknown as (...args: unknown[]) => any;
	box.select = menu.select;
	box.unselect = menu.unselect;
	box.reselect = menu.reselect;
	box.popupSubmenu = menu.popupSubmenu;
	box.closeSubmenu = menu.closeSubmenu;
	box.pointerenter = menu.pointerenter;
}

export function createMenuList(): MenuListElement {
	const el = document.createElement('div');
	el.classList.add('menu-list');
	attachMenuListApi(el);
	return el as unknown as MenuListElement;
}

export const Menu = createMenuList();
