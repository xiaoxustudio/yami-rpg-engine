import { attachApi } from '../../../utils/attach-api';
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
	const box = el as unknown as SelectListApi;
	const setTooltip =
		options?.setTooltip ??
		((targetEl: HTMLElement, tip: string): void => {
			targetEl.title = tip;
		});

	box.state = 'closed';
	box.target = null;
	box.elements = [] as unknown as SelectListApi['elements'];
	box.elements.versionId = 0;
	box.elements.count = 0;
	box.elements.start = -1;
	box.elements.end = -1;
	box.elements.head = null;
	box.elements.foot = null;
	box.selection = null;

	const read = (): unknown => (box.selection as SelectItemElement | null)?.dataValue;

	const write = (value: unknown): void => {
		const elements = box.elements;
		const count = elements.count;
		if (count !== 0) {
			let target = elements[0];
			for (let i = 0; i < count; i++) {
				if ((elements[i] as SelectItemElement).dataValue === value) {
					target = elements[i];
					break;
				}
			}
			select(target);
		}
	};

	const select = (element: HTMLElement): void => {
		if (element instanceof HTMLElement && box.selection !== element) {
			unselect();
			box.selection = element;
			addClass(element, 'selected');
		}
	};

	const unselect = (): void => {
		if (box.selection) {
			removeClass(box.selection, 'selected');
			box.selection = null;
		}
	};

	const reselect = (offset: number): void => {
		const elements = box.elements;
		const selection = box.selection!;
		const index = elements.indexOf(selection) + offset;
		if (index >= 0 && index < elements.count) {
			select(elements[index]);
		}
	};

	const open = (target: SelectTarget): void => {
		close();
		box.state = 'open';

		box.target = target;

		createItems(target.dataItems);

		windowResize();

		document.body.appendChild(box);

		resize();

		write(target.dataValue);
		scrollToSelection();

		box.addEventListener('pointermove', pointermove);
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
		box.target = null;
		clear();
		document.body.removeChild(box);

		box.removeEventListener('pointermove', pointermove);
		window.removeEventListener('keydown', windowKeydown, { capture: true });
		window.removeEventListener('pointerdown', windowPointerdown, { capture: true });
		window.removeEventListener('resize', windowResize);
		window.removeEventListener('blur', windowBlur);
	};

	const resize = (): void => {
		commonListResize(box as unknown as CommonListLike);
	};

	const updateHeadAndFoot = (): void => {
		commonListUpdateHeadAndFoot(box as unknown as CommonListLike);
	};

	const updateOnResize = (): void => {};

	const createItems = (items: SelectItem[]): void => {
		const { elements } = box;
		elements.start = -1;
		elements.count = 0;

		for (const item of items) {
			const li = document.createElement('div');
			addClass(li, 'select-item');
			(li as SelectItemElement).dataValue = item.value as SelectItemElement['dataValue'];
			li.textContent = item.name;
			if (item.tip) {
				setTooltip(li, item.tip);
			}
			elements[elements.count++] = li;
		}

		commonListClearElements(box as unknown as CommonListLike, elements.count);
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
		const selection = box.selection;
		if (selection instanceof HTMLElement) {
			return box.elements.indexOf(selection);
		}
		return defIndex;
	};

	const scrollToSelection = (): void => {
		if (hasScrollBar(box)) {
			const elements = box.elements;
			const selection = box.selection!;
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
		commonListClearElements(box as unknown as CommonListLike, start);
	};

	const clear = (): HTMLElement => {
		unselect();
		box.textContent = '';
		commonListClearElements(box as unknown as CommonListLike, 0);
		box.elements.count = 0;
		box.elements.start = -1;
		box.elements.end = -1;
		updateHeadAndFoot();
		return box;
	};

	const pointermove = (event: PointerEvent): void => {
		const element = (event.target as HTMLElement).closest('.select-item') as HTMLElement | null;
		if (element && !hasClass(element, 'selected')) {
			write((element as SelectItemElement).dataValue);
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
					box.target!.input(value);
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
				const target = box.target!;
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
					target.input((item as SelectItemElement).dataValue);
				}
				close();
				return;
			}
			case 2:
				close();
				return;
		}
	};

	const windowResize = (event?: Event): void => {
		const MAX_LINES = 30;
		const r = rect(box.target!);
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

	const windowBlur = (event: Event): void => {
		close();
	};

	attachApi(box, {
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
