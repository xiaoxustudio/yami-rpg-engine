const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

const addClass = (el: any, className: string): boolean => {
	if (!el || !el.classList) return false;
	if (!el.classList.contains(className)) {
		el.classList.add(className);
		return true;
	}
	return false;
};

const removeClass = (el: any, className: string): boolean => {
	if (!el || !el.classList) return false;
	if (el.classList.contains(className)) {
		el.classList.remove(className);
		return true;
	}
	return false;
};

const hasClass = (el: any, className: string): boolean =>
	!!el && !!el.classList && el.classList.contains(className);

const rect = (el: any): DOMRect => el.getBoundingClientRect();

const hasScrollBar = (el: any): boolean =>
	el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

export interface SelectItem {
	value: any;
	name: string;
	tip?: string;
}

export interface SelectTarget extends HTMLElement {
	dataItems: SelectItem[];
	dataValue: any;
	input(value: any): void;
}

export interface SelectListApiOptions {
	setTooltip?: (el: HTMLElement, tip: string) => void;
}

export interface SelectListApi extends HTMLElement {
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
	createItems(items: SelectItem[]): void;
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

const commonListClearElements = (list: any, start: number): void => {
	let i = start;
	while (list.elements[i] !== undefined) {
		list.elements[i++] = undefined;
	}
};

const commonListUpdateHeadAndFoot = (list: any): void => {
	const el = list;
	if (list.elements.head) {
		list.elements.head.style.marginTop = '';
		list.elements.head = null;
	}
	if (list.elements.foot) {
		list.elements.foot.style.marginBottom = '';
		list.elements.foot = null;
	}
	const { count, start, end } = list.elements;
	if (count !== 0) {
		const pad = el.padded ? 1 : 0;
		const mt = start * 20;
		const mb = (count - end + pad) * 20;
		list.elements.head = list.elements[start];
		list.elements.head!.style.marginTop = `${mt}px`;
		list.elements.foot = list.elements[end - 1];
		list.elements.foot!.style.marginBottom = `${mb}px`;
	}
};

const commonListResize = (list: any): void => {
	const el = list;
	const st = el.scrollTop;
	const ch = el.clientHeight;
	const count = list.elements.count;
	if (ch === 0) return;
	if (count === 0) {
		el.textContent = '';
		return;
	}
	const start = Math.min(Math.floor(st / 20), count - 1);
	const length = Math.ceil(ch / 20) + 1;
	const end = Math.min(start + length, count);
	if (list.elements.start !== start || list.elements.end !== end) {
		list.elements.start = start;
		list.elements.end = end;
		commonListUpdateHeadAndFoot(list);
		const versionId = list.elements.versionId++;
		for (let i = start; i < end; i++) {
			const element = list.elements[i];
			element.versionId = versionId;
			list.updateOnResize(element);
		}
		const nodes = el.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i];
			if (element.versionId !== versionId) {
				element.remove();
			}
		}
		if (list.elements.foot && !list.elements.foot.parentNode) {
			el.appendChild(list.elements.foot);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = list.elements[i];
			if (element.parentNode === null) {
				const next = list.elements[i + 1];
				el.insertBefore(element, next);
			}
		}
	}
};

function getWindowFramesLength(): number {
	const win = (window as any).Window;
	return (win?.frames?.length ?? 0) + 1;
}

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

	const read = (): any => (box.selection as any)?.dataValue;

	const write = (value: any): void => {
		const elements = box.elements;
		const count = elements.count;
		if (count !== 0) {
			let target = elements[0];
			for (let i = 0; i < count; i++) {
				if ((elements[i] as any).dataValue === value) {
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
		commonListResize(box);
	};

	const updateHeadAndFoot = (): void => {
		commonListUpdateHeadAndFoot(box);
	};

	const updateOnResize = (): void => {};

	const createItems = (items: SelectItem[]): void => {
		const { elements } = box;
		elements.start = -1;
		elements.count = 0;

		for (const item of items) {
			const li = document.createElement('div');
			addClass(li, 'select-item');
			(li as any).dataValue = item.value;
			li.textContent = item.name;
			if (item.tip) {
				setTooltip(li, item.tip);
			}
			elements[elements.count++] = li;
		}

		commonListClearElements(box, elements.count);
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
					index * 20 + 20 - (box as any).innerHeight,
					index * 20
				);
				if (box.scrollTop !== scrollTop) {
					box.scrollTop = scrollTop;
				}
			}
		}
	};

	const clearElements = (start: number): void => {
		commonListClearElements(box, start);
	};

	const clear = (): HTMLElement => {
		unselect();
		box.textContent = '';
		commonListClearElements(box, 0);
		box.elements.count = 0;
		box.elements.start = -1;
		box.elements.end = -1;
		updateHeadAndFoot();
		return box;
	};

	const pointermove = (event: PointerEvent): void => {
		const element = (event.target as HTMLElement).closest('.select-item') as HTMLElement | null;
		if (element && !hasClass(element, 'selected')) {
			write((element as any).dataValue);
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
					target.input((item as any).dataValue);
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

	return box;
}

export function createSelectListElement(options?: SelectListApiOptions): HTMLElement {
	const el = document.createElement('div');
	el.classList.add('select-list');
	createSelectListApi(el, options);
	return el;
}
