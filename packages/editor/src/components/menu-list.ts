import { createMenuApi, type MenuApi, type MenuItem, type MenuOptions } from '@ui-kit';

interface MenuListElement extends HTMLElement {
	state: string;
	callback: (() => void) | null;
	dataItems: MenuItem[] | null;
	selection: HTMLElement | null;
	popupTimer: ReturnType<typeof setTimeout> | null;
	closeTimer: ReturnType<typeof setTimeout> | null;
	parent: MenuApi | null;
	submenu: MenuApi | null;
	buttonPressed: boolean;
	minWidth: number;
	parentMenuItem: HTMLElement | null;
	popup(options: MenuOptions, items: MenuItem[]): void;
	computeMenuWidth(): void;
	close(...args: unknown[]): unknown;
	clear(...args: unknown[]): unknown;
	createItem(...args: unknown[]): unknown;
	select(...args: unknown[]): unknown;
	unselect(...args: unknown[]): unknown;
	reselect(offset: number): void;
	popupSubmenu(delay: number): void;
	closeSubmenu(delay: number): void;
	pointerenter(event: Event): void;
}

export function attachMenuListApi(el: HTMLElement): void {
	const menu = createMenuApi(el);
	const box = el as unknown as MenuListElement;
	Object.defineProperty(box, 'state', {
		get: () => menu.state,
		configurable: true
	});
	box.popup = menu.popup;
	box.computeMenuWidth = menu.computeMenuWidth;
	box.close = menu.close;
	box.clear = menu.clear;
	box.createItem = menu.createItem as unknown as (...args: unknown[]) => unknown;
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
