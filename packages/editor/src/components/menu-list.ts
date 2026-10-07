import { createMenuApi, type MenuApi, type MenuItem, type MenuOptions } from '@ui-kit';
import { createDetachedElement } from '@app/utils/dom';

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

export function attachMenuListApi(el: HTMLElement): MenuListElement {
	const menu = createMenuApi(el);
	const box = el as MenuListElement;
	Object.defineProperty(box, 'state', {
		get: () => menu.state,
		configurable: true
	});
	// oxlint-disable-next-line unbound-method
	box.popup = menu.popup;
	// oxlint-disable-next-line unbound-method
	box.computeMenuWidth = menu.computeMenuWidth;
	// oxlint-disable-next-line unbound-method
	box.close = menu.close;
	// oxlint-disable-next-line unbound-method
	box.clear = menu.clear;
	// oxlint-disable-next-line unbound-method
	box.createItem = menu.createItem as (...args: unknown[]) => unknown;
	// oxlint-disable-next-line unbound-method
	box.select = menu.select;
	// oxlint-disable-next-line unbound-method
	box.unselect = menu.unselect;
	// oxlint-disable-next-line unbound-method
	box.reselect = menu.reselect;
	// oxlint-disable-next-line unbound-method
	box.popupSubmenu = menu.popupSubmenu;
	// oxlint-disable-next-line unbound-method
	box.closeSubmenu = menu.closeSubmenu;
	// oxlint-disable-next-line unbound-method
	box.pointerenter = menu.pointerenter;
	return box;
}

export function createMenuList(): MenuListElement {
	const el = createDetachedElement();
	el.classList.add('menu-list');
	return attachMenuListApi(el);
}

export const Menu = createMenuList();
