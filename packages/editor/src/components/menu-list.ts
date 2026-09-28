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
	// 在此之前调用方 `createMenuList` 还要自己再断言一次，而且那次**必须**用 `as unknown as`：
	// 它手上的 `el` 是 `createDetachedElement(): HTMLDivElement`，与 `MenuListElement`
	// **两个方向都不可比**（前者缺后者的必填成员，后者又 extends `HTMLElement` 而非 `HTMLDivElement`）
	// ⇒ TS2352。而这里 `el` 是形参 `HTMLElement`，`MenuListElement` 可赋给 `HTMLElement`
	// ⇒ **单次 `as` 就够**（tsc 会真的检查这次收窄）。所以那次 `unknown` 跳板不是必需，
	// 只是把同一个收窄写了两遍。
	return box;
}

export function createMenuList(): MenuListElement {
	// 离屏节点统一走 utils/dom 的唯一创建缝隙（原先 document.createElement）
	const el = createDetachedElement();
	el.classList.add('menu-list');
	// 装配与收窄都在 `attachMenuListApi` 里完成 ⇒ 这里**零断言**。
	return attachMenuListApi(el);
}

export const Menu = createMenuList();
