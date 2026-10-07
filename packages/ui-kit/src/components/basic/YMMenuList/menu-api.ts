import { attachApi } from '../../../utils/attach-api';
import { elementDataOf } from '../../../utils/element-data';
import { getWindowFramesLength } from '../../../utils/dom';
import { Timer as MenuTimer } from '../../../utils/timer';
export interface MenuItem {
	type?: string;
	label?: string;
	accelerator?: string;
	icon?: HTMLElement;
	enabled?: boolean;
	checked?: boolean;
	style?: string;
	submenu?: MenuItem[];
	click?: () => void;
}

export interface MenuOptions {
	x?: number;
	y?: number;
	close?: () => void;
	parent?: MenuApi | null;
	minWidth?: number;
}

export interface MenuApi {
	el: HTMLElement;
	state: string;
	callback: (() => void) | null;
	dataItems: MenuItem[] | null;
	selection: HTMLElement | null;
	popupTimer: MenuTimer | null;
	closeTimer: MenuTimer | null;
	parent: MenuApi | null;
	submenu: MenuApi | null;
	buttonPressed: boolean;
	minWidth: number;
	parentMenuItem: HTMLElement | null;
	windowBlur: () => void;
	windowKeydown: (event: KeyboardEvent) => void;
	windowPointerdown: (event: PointerEvent) => void;
	windowPointerup: (event: PointerEvent) => void;
	windowPointerover: (event: PointerEvent) => void;
	windowPointerout: (event: PointerEvent) => void;
	popup(options: MenuOptions, items: MenuItem[]): void;
	computeMenuWidth(): void;
	close(): void;
	clear(): HTMLElement;
	createItem(item: MenuItem): HTMLElement;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	popupSubmenu(delay: number): void;
	closeSubmenu(delay: number): void;
	pointerenter(event: PointerEvent): void;
}

type MenuItemElement = HTMLElement & {
	dataValue?: MenuItem;
	label?: HTMLElement;
	accelerator?: HTMLElement;
};

interface MenuItemData {
	dataValue?: MenuItem;
}

const menuItemData = (el: unknown): MenuItemData => elementDataOf<MenuItemData>(el);

export function createMenuApi(el: HTMLElement): MenuApi {
	const menu = {
		el,
		state: 'closed',
		callback: null,
		dataItems: null,
		selection: null,
		popupTimer: null,
		closeTimer: null,
		parent: null,
		submenu: null,
		buttonPressed: false,
		minWidth: 0,
		parentMenuItem: null
	} satisfies Partial<MenuApi> as MenuApi;

	const onWindow = (
		type: string,
		listener: (event: never) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		window.addEventListener(type, listener as EventListener, options);
	};

	const offWindow = (
		type: string,
		listener: (event: never) => void,
		options?: boolean | AddEventListenerOptions
	): void => {
		window.removeEventListener(type, listener as EventListener, options);
	};

	/**
	 * `pointerenter` 是本地函数（`attachApi` 挂在 `menu` 上的就是它本身）。
	 * 以前 add/remove 两处都写成 `menu.pointerenter`——方法引用丢 `this`，正是 unbound-method 的成因；
	 * 这里显式包一层并复用同一个引用（removeEventListener 要求同一函数对象）。
	 */
	const onPointerEnter = (event: Event): void => pointerenter(event as PointerEvent);

	const rect = (element: HTMLElement): DOMRect => element.getBoundingClientRect();

	function popup(options: MenuOptions, items: MenuItem[]): void {
		close();
		menu.state = 'open';
		menu.dataItems = items;
		menu.callback = options.close ?? null;
		menu.parent = options.parent ?? null;
		menu.minWidth = options.minWidth ?? 180;
		for (let i = 0; i < items.length; i++) {
			el.appendChild(createItem(items[i]));
		}
		document.body.appendChild(el);
		computeMenuWidth();
		const { width, height } = rect(el);
		const dpx = 1 / window.devicePixelRatio;
		const right = window.innerWidth - width - dpx;
		const bottom = window.innerHeight - height - dpx;
		const x = options.x ?? 0;
		const y = options.y ?? 0;
		el.style.left = `${Math.min(x + dpx, right)}px`;
		el.style.top = `${Math.min(y + dpx, bottom)}px`;
		el.style.zIndex = String(getWindowFramesLength());
		window.event?.stopPropagation();
		onWindow('blur', menu.windowBlur);
		onWindow('pointerdown', menu.windowPointerdown);
		onWindow('pointerup', menu.windowPointerup);
		onWindow('pointerover', menu.windowPointerover);
		onWindow('pointerout', menu.windowPointerout);
		onWindow('keydown', menu.windowKeydown, { capture: true });
		el.addEventListener('pointerenter', onPointerEnter);
	}

	function computeMenuWidth(): void {
		let labelWidth = 0;
		let acceleratorWidth = 0;
		for (const li of el.childNodes) {
			const { label, accelerator } = li as MenuItemElement;
			if (label !== undefined) {
				labelWidth = Math.max(labelWidth, label.offsetWidth);
			}
			if (accelerator !== undefined) {
				acceleratorWidth = Math.max(acceleratorWidth, accelerator.offsetWidth);
			}
		}
		let padding = 48;
		if (labelWidth > 0 && acceleratorWidth > 0) {
			padding += 10;
		}
		const width = labelWidth + acceleratorWidth + padding;
		el.style.width = `${Math.max(width, menu.minWidth)}px`;
	}

	function close(): void {
		if (menu.state === 'open') {
			menu.state = 'closed';
			unselect();
			menu.callback?.();
			menu.callback = null;
			menu.submenu?.close();
			menu.dataItems = null;
			menu.parent = null;
			menu.buttonPressed = false;
			document.body.removeChild(clear());
			offWindow('blur', menu.windowBlur);
			offWindow('pointerdown', menu.windowPointerdown);
			offWindow('pointerup', menu.windowPointerup);
			offWindow('pointerover', menu.windowPointerover);
			offWindow('pointerout', menu.windowPointerout);
			offWindow('keydown', menu.windowKeydown, { capture: true });
			el.removeEventListener('pointerenter', onPointerEnter);
		}
	}

	function clear(): HTMLElement {
		el.textContent = '';
		return el;
	}

	function createItem(item: MenuItem): HTMLElement {
		switch (item.type) {
			case 'separator': {
				const separator = document.createElement('div');
				separator.classList.add('menu-separator');
				return separator;
			}
			default: {
				const li = document.createElement('div');
				li.classList.add('menu-item');
				menuItemData(li).dataValue = item;
				if (item.enabled === false) {
					li.classList.add('disabled');
				}
				if (item.checked === true) {
					const mark = document.createElement('div');
					mark.classList.add('menu-checked');
					mark.textContent = '\u2713';
					li.appendChild(mark);
				}
				if (item.icon !== undefined) {
					li.appendChild(item.icon!);
				}
				if (item.label !== undefined) {
					const label = document.createElement('div');
					label.classList.add('menu-label');
					label.textContent = item.label;
					(li as MenuItemElement).label = label;
					li.appendChild(label);
				}
				if (item.accelerator !== undefined) {
					const accelerator = document.createElement('div');
					accelerator.classList.add('menu-accelerator');
					accelerator.textContent = item.accelerator;
					(li as MenuItemElement).accelerator = accelerator;
					li.appendChild(accelerator);
				}
				if (item.style !== undefined) {
					li.classList.add(item.style);
				}
				if (item.submenu !== undefined) {
					const subMark = document.createElement('div');
					subMark.classList.add('menu-sub-mark');
					subMark.textContent = '>';
					li.appendChild(subMark);
				}
				return li;
			}
		}
	}

	function select(element: HTMLElement): void {
		if (menu.selection !== element) {
			unselect();
			menu.selection = element;
			menu.selection!.classList.add('selected');
		}
	}

	function unselect(): void {
		if (menu.selection) {
			menu.selection.classList.remove('selected');
			menu.selection = null;
			if (menu.popupTimer) {
				menu.popupTimer.remove();
				menu.popupTimer = null;
			}
		}
	}

	function reselect(offset: number): void {
		const elements: HTMLElement[] = [];
		for (const child of el.childNodes) {
			const element = child as HTMLElement;
			if (
				element.classList.contains('menu-item') &&
				!element.classList.contains('disabled')
			) {
				elements.push(element);
			}
		}
		const length = elements.length;
		if (length === 0) {
			return;
		}
		if (menu.selection) {
			const last = elements.indexOf(menu.selection);
			const index = (last + offset + length) % length;
			select(elements[index]);
		} else {
			switch (offset) {
				case 1:
					select(elements[0]);
					break;
				case -1:
					select(elements[length - 1]);
					break;
			}
		}
	}

	function popupSubmenu(delay: number): void {
		const element = menu.selection;
		if (element instanceof HTMLElement && element !== menu.submenu?.parentMenuItem) {
			const node = menuItemData(element).dataValue as MenuItem;
			if (node.submenu) {
				if (!menu.popupTimer) {
					menu.popupTimer = new MenuTimer({
						duration: delay,
						callback: () => {
							menu.popupTimer = null;
							if (element === menu.selection) {
								const r = rect(element);
								let x = r.right;
								let y = r.top - 5;
								let width = r.width + 2;
								if (x + width > window.innerWidth) {
									x = r.left - width;
								}
								menu.submenu?.close();
								const subEl = document.createElement('div');
								subEl.classList.add('menu-list');
								menu.submenu = createMenuApi(subEl);
								menu.submenu.parentMenuItem = element;
								menu.submenu.popup(
									{
										x,
										y,
										parent: menu,
										close: () => {
											menu.submenu = null;
										}
									},
									node.submenu!
								);
							}
						}
					}).add();
				}
				if (delay === 0) {
					menu.popupTimer.finish();
				}
			}
		}
	}

	function closeSubmenu(delay: number): void {
		const { submenu, selection } = menu;
		if (submenu?.parentMenuItem === selection) {
			if (!menu.closeTimer) {
				menu.closeTimer = new MenuTimer({
					duration: delay,
					callback: () => {
						menu.closeTimer = null;
						if (submenu === menu.submenu && selection !== menu.selection) {
							submenu.close();
						}
					}
				}).add();
			}
		}
	}

	function pointerenter(_event: PointerEvent): void {
		(menu.parent as MenuApi)?.select(menu.parentMenuItem as HTMLElement);
	}

	function windowBlur(): void {
		close();
	}

	function windowKeydown(event: KeyboardEvent): void {
		if (!menu.submenu) {
			event.preventDefault();
			event.stopPropagation();
			switch (event.code) {
				case 'Escape':
					close();
					break;
				case 'Enter':
				case 'NumpadEnter':
					if (menu.selection) {
						const node = menuItemData(menu.selection).dataValue as MenuItem;
						if (node.submenu) {
							popupSubmenu(0);
							(menu.submenu as MenuApi | null)?.reselect(1);
						} else {
							if (node.click) node.click();
							let m: MenuApi | null = menu;
							while (m!.parent) {
								m = m!.parent;
							}
							m!.close();
						}
					}
					break;
				case 'ArrowUp':
					reselect(-1);
					break;
				case 'ArrowDown':
					reselect(1);
					break;
				case 'ArrowLeft':
					if (menu.parent) {
						close();
					}
					break;
				case 'ArrowRight':
					popupSubmenu(0);
					(menu.submenu as MenuApi | null)?.reselect(1);
					break;
			}
		}
	}

	function windowPointerdown(event: PointerEvent): void {
		const element = (event.target as HTMLElement).closest('.menu-list');
		if (
			element !== null ||
			((document.activeElement instanceof HTMLInputElement ||
				document.activeElement instanceof HTMLTextAreaElement) &&
				document.activeElement !== event.target &&
				!(
					event.target instanceof HTMLInputElement ||
					event.target instanceof HTMLTextAreaElement
				))
		) {
			event.preventDefault();
		}
		switch (event.button) {
			case 0:
				if (element === null) {
					close();
				} else if (element === el) {
					menu.buttonPressed = true;
				}
				break;
			case 2:
				if (element === null) {
					close();
				}
				break;
		}
	}

	function windowPointerup(event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement;
				if (element.classList.contains('menu-item')) {
					if (menu.buttonPressed) {
						menu.buttonPressed = false;
						if (!element.classList.contains('disabled')) {
							const node = menuItemData(element).dataValue as MenuItem;
							if (node.submenu) {
								popupSubmenu(0);
							} else if (node.click) {
								let m: MenuApi | null = menu;
								while (m!.parent) {
									m = m!.parent;
								}
								node.click();
								m!.close();
							}
						}
					}
				} else if (element.classList.contains('menu-list')) {
					break;
				} else {
					close();
				}
				break;
			}
		}
	}

	function windowPointerover(event: PointerEvent): void {
		const element = event.target as HTMLElement;
		if (
			element !== menu.selection &&
			element.parentNode === el &&
			element.classList.contains('menu-item') &&
			!element.classList.contains('disabled')
		) {
			if (menu.closeTimer && menu.submenu!.parentMenuItem === element) {
				menu.closeTimer.remove();
				menu.closeTimer = null;
			}
			closeSubmenu(400);
			select(element);
			popupSubmenu(400);
		}
	}

	function windowPointerout(event: PointerEvent): void {
		const element = event.target;
		if (menu.selection === element) {
			if (menu.submenu !== null) {
				closeSubmenu(400);
			}
			unselect();
		}
	}

	attachApi<MenuApi>(menu, {
		windowBlur,
		windowKeydown,
		windowPointerdown,
		windowPointerup,
		windowPointerover,
		windowPointerout,
		popup,
		computeMenuWidth,
		close,
		clear,
		createItem,
		select,
		unselect,
		reselect,
		popupSubmenu,
		closeSubmenu,
		pointerenter
	});
	return menu;
}

export function createMenuListElement(): HTMLElement {
	const el = document.createElement('div');
	el.classList.add('menu-list');
	createMenuApi(el);
	return el;
}
