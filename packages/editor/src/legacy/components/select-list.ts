function getWindow() {
	return (window as any).Window;
}
import {
	on,
	off,
	addClass,
	removeClass,
	hasClass,
	rect,
	setTooltip,
	hasScrollBar,
	listenDraggingScrollbarEvent
} from '@/util/element-utils.ts';
import { CommonList } from './common-list.ts';

interface SelectTarget extends HTMLElement {
	dataItems: Array<{ value: any; name: string; tip?: string }>;
	dataValue: any;
	input(value: any): void;
	selectList?: SelectListElement | null;
}

interface SelectItemElement extends HTMLElement {
	dataValue: any;
}

export interface SelectListElement extends HTMLElement {
	state: 'open' | 'closed';
	target: SelectTarget | null;
	elements: SelectItemElement[] & {
		versionId: number;
		count: number;
		start: number;
		end: number;
		head: HTMLElement | null;
		foot: HTMLElement | null;
	};
	selection: HTMLElement | null;
	read(): any;
	write(value: any): void;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	open(target: SelectTarget): void;
	close(): void;
	resize(): void;
	updateHeadAndFoot(): void;
	updateOnResize(): void;
	createItems(items: Array<{ value: any; name: string; tip?: string }>): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	getElementIndexOfSelection(defIndex: number): number;
	scrollToSelection(): void;
	clearElements(start: number): void;
	clear(): HTMLElement;
	pointermove(event: PointerEvent): void;
	windowKeydown(event: KeyboardEvent): void;
	windowPointerdown(event: PointerEvent): void;
	windowResize(event?: Event): void;
	windowBlur(event: Event): void;
}

export function attachSelectListApi(el: HTMLElement): void {
	const box = el as SelectListElement;

	box.state = 'closed';
	box.target = null;
	box.elements = [] as unknown as SelectListElement['elements'];
	box.elements.versionId = 0;
	box.elements.count = 0;
	box.elements.start = -1;
	box.elements.end = -1;
	box.elements.head = null;
	box.elements.foot = null;
	box.selection = null;
	listenDraggingScrollbarEvent(box);
	on(box, 'scroll', resize);

	function read(): any {
		return (box.selection as SelectItemElement | null)?.dataValue;
	}

	function write(value: any): void {
		const elements = box.elements;
		const count = elements.count;
		if (count !== 0) {
			let target = elements[0];
			for (let i = 0; i < count; i++) {
				if (elements[i].dataValue === value) {
					target = elements[i];
					break;
				}
			}
			select(target);
		}
	}

	function select(element: HTMLElement): void {
		if (element instanceof HTMLElement && box.selection !== element) {
			unselect();
			box.selection = element;
			addClass(element, 'selected');
		}
	}

	function unselect(): void {
		if (box.selection) {
			removeClass(box.selection, 'selected');
			box.selection = null;
		}
	}

	function reselect(offset: number): void {
		const elements = box.elements;
		const selection = box.selection!;
		const index = elements.indexOf(selection) + offset;
		if (index >= 0 && index < elements.count) {
			select(elements[index]);
		}
	}

	function open(target: SelectTarget): void {
		close();
		box.state = 'open';

		box.target = target;

		createItems(target.dataItems);

		windowResize();

		document.body.appendChild(box);

		resize();

		write(target.dataValue);
		scrollToSelection();

		on(box, 'pointermove', pointermove as (event: EditorEvent) => void);
		on(window as any, 'keydown', windowKeydown as (event: EditorEvent) => void, {
			capture: true
		});
		on(window as any, 'pointerdown', windowPointerdown as (event: EditorEvent) => void, {
			capture: true
		});
		on(window as any, 'resize', windowResize as (event: EditorEvent) => void);
		on(window as any, 'blur', windowBlur as (event: EditorEvent) => void);
	}

	function close(): void {
		if (box.state === 'closed') {
			return;
		}

		box.state = 'closed';
		box.target = null;
		clear();
		document.body.removeChild(box);

		off(box, 'pointermove', pointermove as (event: EditorEvent) => void);
		off(window as any, 'keydown', windowKeydown as (event: EditorEvent) => void, {
			capture: true
		});
		off(window as any, 'pointerdown', windowPointerdown as (event: EditorEvent) => void, {
			capture: true
		});
		off(window as any, 'resize', windowResize as (event: EditorEvent) => void);
		off(window as any, 'blur', windowBlur as (event: EditorEvent) => void);
	}

	function resize(): void {
		CommonList.resize(box as unknown as CommonList);
	}

	function updateHeadAndFoot(): void {
		CommonList.updateHeadAndFoot(box as unknown as CommonList);
	}

	function updateOnResize(): void {}

	function createItems(items: Array<{ value: any; name: string; tip?: string }>): void {
		const { elements } = box;
		elements.start = -1;
		elements.count = 0;

		for (const item of items) {
			const li = document.createElement('div');
			addClass(li, 'select-item');
			(li as SelectItemElement).dataValue = item.value;
			li.textContent = item.name;
			if (item.tip) {
				setTooltip(li, item.tip);
			}
			elements[elements.count++] = li;
		}

		clearElements(elements.count);
	}

	function pageUp(select: boolean): void {
		const scrollLines = Math.floor(box.clientHeight / 20) - 1;
		if (select) {
			const bottom = box.scrollTop + box.clientHeight;
			const bottomIndex = Math.floor(bottom / 20) - 1;
			let index = getElementIndexOfSelection(Infinity);
			index = Math.min(index, bottomIndex) - scrollLines;
			index = Math.max(index, 0);
			box.select(box.elements[index]);
		}
		box.scrollBy(0, -scrollLines * 20);
	}

	function pageDown(select: boolean): void {
		const scrollLines = Math.floor(box.clientHeight / 20) - 1;
		if (select) {
			const count = box.elements.count;
			const topIndex = Math.floor(box.scrollTop / 20);
			let index = getElementIndexOfSelection(0);
			index = Math.max(index, topIndex) + scrollLines;
			index = Math.min(index, count - 1);
			box.select(box.elements[index]);
		}
		box.scrollBy(0, +scrollLines * 20);
	}

	function getElementIndexOfSelection(defIndex: number): number {
		const selection = box.selection;
		if (selection instanceof HTMLElement) {
			return box.elements.indexOf(selection);
		}
		return defIndex;
	}

	function scrollToSelection(): void {
		if (hasScrollBar(box)) {
			const elements = box.elements;
			const selection = box.selection!;
			const index = elements.indexOf(selection);
			if (index !== -1) {
				const scrollTop = Math.clamp(
					box.scrollTop,
					index * 20 + 20 - box.innerHeight,
					index * 20
				);
				if (box.scrollTop !== scrollTop) {
					box.scrollTop = scrollTop;
				}
			}
		}
	}

	function clearElements(start: number): void {
		CommonList.clearElements(box as unknown as CommonList, start);
	}

	function clear(): HTMLElement {
		unselect();
		box.textContent = '';
		clearElements(0);
		box.elements.count = 0;
		box.elements.start = -1;
		box.elements.end = -1;
		updateHeadAndFoot();
		return box;
	}

	function pointermove(event: PointerEvent): void {
		const element = (event.target as HTMLElement).closest(
			'.select-item'
		) as SelectItemElement | null;
		if (element && !hasClass(element, 'selected')) {
			write(element.dataValue);
		}
	}

	function windowKeydown(event: KeyboardEvent): void {
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
	}

	function windowPointerdown(event: PointerEvent): void {
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
				const item = eventTarget.closest('.select-item') as SelectItemElement | null;
				if (item && item.parentNode === box) {
					event.preventDefault();
					if (event.altKey) {
						return;
					}
					target.input(item.dataValue);
				}
				close();
				return;
			}
			case 2:
				close();
				return;
		}
	}

	function windowResize(event?: Event): void {
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
		box.style.zIndex = `${(getWindow().frames?.length ?? 0) + 1}`;
	}

	function windowBlur(event: Event): void {
		close();
	}

	box.read = read;
	box.write = write;
	box.select = select;
	box.unselect = unselect;
	box.reselect = reselect;
	box.open = open;
	box.close = close;
	box.resize = resize;
	box.updateHeadAndFoot = updateHeadAndFoot;
	box.updateOnResize = updateOnResize;
	box.createItems = createItems;
	box.pageUp = pageUp;
	box.pageDown = pageDown;
	box.getElementIndexOfSelection = getElementIndexOfSelection;
	box.scrollToSelection = scrollToSelection;
	box.clearElements = clearElements;
	box.clear = clear;
	box.pointermove = pointermove;
	box.windowKeydown = windowKeydown;
	box.windowPointerdown = windowPointerdown;
	box.windowResize = windowResize;
	box.windowBlur = windowBlur;
}

export function createSelectList(): SelectListElement {
	const el = document.createElement('div');
	addClass(el, 'select-list');
	attachSelectListApi(el);
	return el as unknown as SelectListElement;
}

// 注：Select 必须是真实的 SelectList 实例（继承其 windowPointerdown/windowKeydown/resize/createItems 等所有方法）。此前类型化时误改为简化对象字面量 {target,open,close}，导致所有 Select.windowPointerdown 等调用失效 —— 下拉列表点击行为全部断裂。
export const Select = createSelectList();
