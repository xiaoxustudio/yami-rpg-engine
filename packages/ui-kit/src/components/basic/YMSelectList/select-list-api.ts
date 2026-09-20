import { attachApi } from '../../../utils/attach-api';
import { elementDataOf, elementDataValueOf } from '../../../utils/element-data';
import {
	clamp,
	addClass,
	removeClass,
	hasClass,
	rect,
	hasScrollBar,
	getWindowFramesLength
} from '../../../utils/dom';
import {
	commonListClearElements,
	commonListUpdateHeadAndFoot,
	commonListResize
} from '../../../utils/common-list';
import type { CommonListLike } from '../../../utils/common-list';
export interface SelectItem {
	value: unknown;
	name: string;
	tip?: string;
}

export type SelectTarget = HTMLElement & {
	dataItems: SelectItem[];
	dataValue: unknown;
	input(...args: unknown[]): void;
};

export interface SelectListApiOptions {
	setTooltip?: (el: HTMLElement, tip: string) => void;
}

type SelectItemElement = HTMLElement & {
	dataValue?: unknown;
};

/**
 * P4b：下拉列表元素（`box`）自身的元素数据——`target` 是宿主 select-box 元素，
 * `selection` 是当前选中项元素。
 */
interface SelectListElementData {
	target: SelectTarget | null;
	selection: HTMLElement | null;
}
const listData = (el: unknown): SelectListElementData => elementDataOf<SelectListElementData>(el);

/** P4b：宿主 select-box 元素（`SelectTarget`）自身的元素数据 */
const targetData = (el: unknown): { dataItems: SelectItem[]; dataValue: unknown } =>
	elementDataOf<{ dataItems: SelectItem[]; dataValue: unknown }>(el);

/** P4b：列表项元素（`SelectItemElement`）自身的元素数据 */
const itemData = (el: unknown): SelectItemElement => elementDataOf<SelectItemElement>(el);

/**
 * P4b：`?.` 兼容视图——`box.selection` 允许为 null，直接交给 `elementDataOf` 会抛 WeakMap key 错
 * （原写法 `box.selection?.dataValue` 在 null 时短路成 undefined）。
 */
const itemDataOrUndefined = (el: unknown): SelectItemElement | undefined =>
	el == null ? undefined : itemData(el);

export type SelectListApi = HTMLElement & {
	state: 'open' | 'closed';
	target: SelectTarget | null;
	elements: HTMLElement[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selection: HTMLElement | null;
	innerHeight: number;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	select(...args: unknown[]): void;
	unselect(...args: unknown[]): void;
	reselect(...args: unknown[]): void;
	open(...args: unknown[]): void;
	close(...args: unknown[]): void;
	resize(...args: unknown[]): void;
	updateHeadAndFoot(): void;
	updateOnResize(): void;
	createItems(items: SelectItem[]): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	getElementIndexOfSelection(defIndex: number): number;
	scrollToSelection(): void;
	clearElements(start: number): void;
	clear(...args: unknown[]): HTMLElement;
	pointermove(event: PointerEvent): void;
	windowKeydown(event: KeyboardEvent): void;
	windowPointerdown(event: PointerEvent): void;
	windowResize(event?: Event): void;
	windowBlur(event: Event): void;
};

export function createSelectListApi(
	el: HTMLElement,
	options?: SelectListApiOptions
): SelectListApi {
	const box = el as SelectListApi;
	// P4b：`target` / `selection` 走显式元素数据
	const data = listData(box);
	const setTooltip =
		options?.setTooltip ??
		((targetEl: HTMLElement, tip: string): void => {
			targetEl.title = tip;
		});

	box.state = 'closed';
	data.target = null;
	box.elements = [] as unknown as SelectListApi['elements'];
	box.elements.versionId = 0;
	box.elements.count = 0;
	box.elements.start = -1;
	box.elements.end = -1;
	box.elements.head = null;
	box.elements.foot = null;
	data.selection = null;

	const read = (): unknown => itemDataOrUndefined(data.selection)?.dataValue;

	const write = (value: unknown): void => {
		const elements = box.elements;
		const count = elements.count;
		if (count !== 0) {
			let target = elements[0];
			for (let i = 0; i < count; i++) {
				if (itemData(elements[i]).dataValue === value) {
					target = elements[i];
					break;
				}
			}
			select(target);
		}
	};

	const select = (element: HTMLElement): void => {
		if (element instanceof HTMLElement && data.selection !== element) {
			unselect();
			data.selection = element;
			addClass(element, 'selected');
		}
	};

	const unselect = (): void => {
		if (data.selection) {
			removeClass(data.selection, 'selected');
			data.selection = null;
		}
	};

	const reselect = (offset: number): void => {
		const elements = box.elements;
		const selection = data.selection!;
		const index = elements.indexOf(selection) + offset;
		if (index >= 0 && index < elements.count) {
			select(elements[index]);
		}
	};

	const open = (target: SelectTarget): void => {
		close();
		box.state = 'open';

		data.target = target;

		createItems(targetData(target).dataItems);

		windowResize();

		document.body.appendChild(box);

		resize();

		// P4b：`dataItems` 是宿主的元素数据；`dataValue` 则是**两种承载者**——`select-box-api` /
		// `YMSelectBox.vue` 等宿主给 `dataValue` 装了 own 访问器（own 覆盖原型），而独立使用的选择列表
		// 元素上没有 own 访问器（走元素数据）。故这一读统一走 `elementDataValueOf`（own 优先、否则元素数据），
		// 两种宿主都对——原型访问器退役后仍然成立。
		write(elementDataValueOf(target));
		scrollToSelection();

		box.addEventListener('pointermove', pointermove);
		box.addEventListener('scroll', resize);
		window.addEventListener('keydown', windowKeydown, { capture: true });
		window.addEventListener('pointerdown', windowPointerdown, { capture: true });
		window.addEventListener('resize', windowResize);
		window.addEventListener('blur', windowBlur);
	};

	const close = (): void => {
		if (box.state === 'closed') {
			return;
		}

		box.state = 'closed';
		data.target = null;
		clear();
		document.body.removeChild(box);

		box.removeEventListener('pointermove', pointermove);
		box.removeEventListener('scroll', resize);
		window.removeEventListener('keydown', windowKeydown, { capture: true });
		window.removeEventListener('pointerdown', windowPointerdown, { capture: true });
		window.removeEventListener('resize', windowResize);
		window.removeEventListener('blur', windowBlur);
	};

	const resize = (): void => {
		commonListResize(box as CommonListLike);
	};

	const updateHeadAndFoot = (): void => {
		commonListUpdateHeadAndFoot(box as CommonListLike);
	};

	const updateOnResize = (): void => {};

	const createItems = (items: SelectItem[]): void => {
		const { elements } = box;
		elements.start = -1;
		elements.count = 0;

		for (const item of items) {
			const li = document.createElement('div');
			addClass(li, 'select-item');
			itemData(li).dataValue = item.value as SelectItemElement['dataValue'];
			li.textContent = item.name;
			if (item.tip) {
				setTooltip(li, item.tip);
			}
			elements[elements.count++] = li;
		}

		commonListClearElements(box as CommonListLike, elements.count);
	};

	const pageUp = (selectFlag: boolean): void => {
		const scrollLines = Math.floor(box.clientHeight / 20) - 1;
		if (selectFlag) {
			const bottom = box.scrollTop + box.clientHeight;
			const bottomIndex = Math.floor(bottom / 20) - 1;
			let index = getElementIndexOfSelection(Infinity);
			index = Math.min(index, bottomIndex) - scrollLines;
			index = Math.max(index, 0);
			box.select(box.elements[index]);
		}
		box.scrollBy(0, -scrollLines * 20);
	};

	const pageDown = (selectFlag: boolean): void => {
		const scrollLines = Math.floor(box.clientHeight / 20) - 1;
		if (selectFlag) {
			const count = box.elements.count;
			const topIndex = Math.floor(box.scrollTop / 20);
			let index = getElementIndexOfSelection(0);
			index = Math.max(index, topIndex) + scrollLines;
			index = Math.min(index, count - 1);
			box.select(box.elements[index]);
		}
		box.scrollBy(0, +scrollLines * 20);
	};

	const getElementIndexOfSelection = (defIndex: number): number => {
		const selection = data.selection;
		if (selection instanceof HTMLElement) {
			return box.elements.indexOf(selection);
		}
		return defIndex;
	};

	const scrollToSelection = (): void => {
		if (hasScrollBar(box)) {
			const elements = box.elements;
			const selection = data.selection!;
			const index = elements.indexOf(selection);
			if (index !== -1) {
				const scrollTop = clamp(
					box.scrollTop,
					index * 20 + 20 - box.innerHeight,
					index * 20
				);
				if (box.scrollTop !== scrollTop) {
					box.scrollTop = scrollTop;
				}
			}
		}
	};

	const clearElements = (start: number): void => {
		commonListClearElements(box as CommonListLike, start);
	};

	const clear = (): HTMLElement => {
		unselect();
		box.textContent = '';
		commonListClearElements(box as CommonListLike, 0);
		box.elements.count = 0;
		box.elements.start = -1;
		box.elements.end = -1;
		updateHeadAndFoot();
		return box;
	};

	const pointermove = (event: PointerEvent): void => {
		const element = (event.target as HTMLElement).closest('.select-item') as HTMLElement | null;
		if (element && !hasClass(element, 'selected')) {
			write(itemData(element).dataValue);
		}
	};

	const windowKeydown = (event: KeyboardEvent): void => {
		event.preventDefault();
		event.stopPropagation();
		switch (event.code) {
			case 'Escape':
				close();
				break;
			case 'Enter':
			case 'NumpadEnter': {
				const value = read();
				if (value !== undefined) {
					data.target!.input(value);
				}
				close();
				break;
			}
			case 'ArrowUp':
				reselect(-1);
				scrollToSelection();
				break;
			case 'ArrowDown':
				reselect(1);
				scrollToSelection();
				break;
			case 'Home': {
				const elements = box.elements;
				box.scroll(0, 0);
				select(elements[0]);
				break;
			}
			case 'End': {
				const elements = box.elements;
				const last = elements.count - 1;
				box.scroll(0, box.scrollHeight);
				select(elements[last]);
				break;
			}
			case 'PageUp':
				pageUp(true);
				break;
			case 'PageDown':
				pageDown(true);
				break;
		}
	};

	const windowPointerdown = (event: PointerEvent): void => {
		switch (event.button) {
			case 0: {
				const target = data.target!;
				const eventTarget = event.target as HTMLElement;
				if (eventTarget === box) {
					event.preventDefault();
					return;
				}
				if (eventTarget.closest('.select-box') === target) {
					event.stopImmediatePropagation();
					close();
					return;
				}
				const item = eventTarget.closest('.select-item') as HTMLElement | null;
				if (item && item.parentNode === box) {
					event.preventDefault();
					if (event.altKey) {
						return;
					}
					target.input(itemData(item).dataValue);
				}
				close();
				return;
			}
			case 2:
				close();
				return;
		}
	};

	const windowResize = (_event?: Event): void => {
		const MAX_LINES = 30;
		const r = rect(data.target!);
		const rl = r.left;
		const rt = r.top;
		const rb = r.bottom;
		const rw = r.width;
		const count = box.elements.count;
		const space = window.innerHeight - rb;
		const below = space >= Math.min(count, 10) * 20;
		const capacity = below ? Math.floor(space / 20) : Math.floor(rt / 20);
		const lines = Math.min(count, capacity, MAX_LINES);
		const top = below ? rb : rt - lines * 20;
		box.style.left = `${rl}px`;
		box.style.top = `${top}px`;
		box.style.width = `calc(${rw}px - var(--2dpx))`;
		box.style.height = `${lines * 20}px`;
		box.style.zIndex = `${getWindowFramesLength()}`;
	};

	const windowBlur = (_event: Event): void => {
		close();
	};

	attachApi<SelectListApi>(box, {
		read,
		write,
		select,
		unselect,
		reselect,
		open,
		close,
		resize,
		updateHeadAndFoot,
		updateOnResize,
		createItems,
		pageUp,
		pageDown,
		getElementIndexOfSelection,
		scrollToSelection,
		clearElements,
		clear,
		pointermove,
		windowKeydown,
		windowPointerdown,
		windowResize,
		windowBlur
	});

	return box;
}

export function createSelectListElement(options?: SelectListApiOptions): HTMLElement {
	const el = document.createElement('div');
	el.classList.add('select-list');
	createSelectListApi(el, options);
	return el;
}
