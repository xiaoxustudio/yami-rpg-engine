<template>
	<div class="select-list" ref="root" :id="props.id"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
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
} from '@/util/element-utils';

function getWindow() {
	return (window as any).Window;
}

interface SelectTarget extends HTMLElement {
	dataItems: Array<{ value: any; name: string; tip?: string }>;
	dataValue: any;
	input(value: any): void;
}

interface SelectItemElement extends HTMLElement {
	dataValue: any;
}

interface ListData {
	versionId: number;
	count: number;
	start: number;
	end: number;
	head: HTMLElement | null;
	foot: HTMLElement | null;
}

interface SelectListElement extends HTMLElement {
	read(): any;
	write(value: any): void;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	open(target: SelectTarget): void;
	close(): void;
	resize(): void;
	updateHeadAndFoot(): void;
	updateOnResize(element?: HTMLElement): void;
	createItems(items: Array<{ value: any; name: string; tip?: string }>): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	getElementIndexOfSelection(defIndex: number): number;
	scrollToSelection(): void;
	clearElements(start: number): void;
	clear(): HTMLElement;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<SelectListElement | null>(null);

let state = 'closed';
let target: SelectTarget | null = null;
let elements = [] as any[] & ListData;
elements.versionId = 0;
elements.count = 0;
elements.start = -1;
elements.end = -1;
elements.head = null;
elements.foot = null;
let selection: HTMLElement | null = null;

const read = (): any => (selection as SelectItemElement | null)?.dataValue;

const write = (value: any): void => {
	const count = elements.count;
	if (count !== 0) {
		let t = elements[0];
		for (let i = 0; i < count; i++) {
			if (elements[i].dataValue === value) {
				t = elements[i];
				break;
			}
		}
		select(t);
	}
};

const select = (element: HTMLElement): void => {
	if (element instanceof HTMLElement && selection !== element) {
		unselect();
		selection = element;
		addClass(element, 'selected');
	}
};

const unselect = (): void => {
	if (selection) {
		removeClass(selection, 'selected');
		selection = null;
	}
};

const reselect = (offset: number): void => {
	const index = elements.indexOf(selection) + offset;
	if (index >= 0 && index < elements.count) {
		select(elements[index]);
	}
};

const open = (t: SelectTarget): void => {
	const el = root.value;
	if (!el) return;
	close();
	state = 'open';
	target = t;
	createItems(t.dataItems);
	windowResize();
	document.body.appendChild(el);
	resize();
	write(t.dataValue);
	scrollToSelection();
	on(el, 'pointermove', pointermove as (event: EditorEvent) => void);
	on(window as any, 'keydown', windowKeydown as (event: EditorEvent) => void, {
		capture: true
	});
	on(window as any, 'pointerdown', windowPointerdown as (event: EditorEvent) => void, {
		capture: true
	});
	on(window as any, 'resize', windowResize as (event: EditorEvent) => void);
	on(window as any, 'blur', windowBlur as (event: EditorEvent) => void);
};

const close = (): void => {
	const el = root.value;
	if (!el || state === 'closed') return;
	state = 'closed';
	target = null;
	clear();
	document.body.removeChild(el);
	off(el, 'pointermove', pointermove as (event: EditorEvent) => void);
	off(window as any, 'keydown', windowKeydown as (event: EditorEvent) => void, {
		capture: true
	});
	off(window as any, 'pointerdown', windowPointerdown as (event: EditorEvent) => void, {
		capture: true
	});
	off(window as any, 'resize', windowResize as (event: EditorEvent) => void);
	off(window as any, 'blur', windowBlur as (event: EditorEvent) => void);
};

const updateHeadAndFoot = (): void => {
	const el = root.value;
	if (!el) return;
	if (elements.head) {
		elements.head.style.marginTop = '';
		elements.head = null;
	}
	if (elements.foot) {
		elements.foot.style.marginBottom = '';
		elements.foot = null;
	}
	const { count, start, end } = elements;
	if (count !== 0) {
		const pad = (el as HTMLElement & { padded?: boolean }).padded ? 1 : 0;
		const mt = start * 20;
		const mb = (count - end + pad) * 20;
		elements.head = elements[start];
		elements.head!.style.marginTop = `${mt}px`;
		elements.foot = elements[end - 1];
		elements.foot!.style.marginBottom = `${mb}px`;
	}
};

const resize = (): void => {
	const el = root.value;
	if (!el) return;
	const st = el.scrollTop;
	const ch = el.innerHeight;
	const count = elements.count;
	if (ch === 0) {
		return;
	}
	if (count === 0) {
		el.textContent = '';
		return;
	}
	const start = Math.min(Math.floor(st / 20), count - 1);
	const length = Math.ceil(ch / 20) + 1;
	const end = Math.min(start + length, count);
	if (elements.start !== start || elements.end !== end) {
		elements.start = start;
		elements.end = end;
		updateHeadAndFoot();
		const versionId = elements.versionId++;
		for (let i = start; i < end; i++) {
			const element = elements[i];
			(element as HTMLElement & { versionId?: number }).versionId = versionId;
			updateOnResize(element);
		}
		const nodes = el.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i] as HTMLElement & {
				versionId?: number;
			};
			if (element.versionId !== versionId) {
				element.remove();
			}
		}
		if (!elements.foot!.parentNode) {
			el.appendChild(elements.foot!);
		}
		for (let i = end - 2; i >= start; i--) {
			const element = elements[i];
			if (element.parentNode === null) {
				const next = elements[i + 1];
				el.insertBefore(element, next);
			}
		}
	}
};

const updateOnResize = (_element?: HTMLElement): void => {};

const createItems = (items: Array<{ value: any; name: string; tip?: string }>): void => {
	const el = root.value;
	if (!el) return;
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
};

const pageUp = (sel: boolean): void => {
	const el = root.value;
	if (!el) return;
	const scrollLines = Math.floor(el.clientHeight / 20) - 1;
	if (sel) {
		const bottom = el.scrollTop + el.clientHeight;
		const bottomIndex = Math.floor(bottom / 20) - 1;
		let index = getElementIndexOfSelection(Infinity);
		index = Math.min(index, bottomIndex) - scrollLines;
		index = Math.max(index, 0);
		select(elements[index]);
	}
	el.scrollBy(0, -scrollLines * 20);
};

const pageDown = (sel: boolean): void => {
	const el = root.value;
	if (!el) return;
	const scrollLines = Math.floor(el.clientHeight / 20) - 1;
	if (sel) {
		const count = elements.count;
		const topIndex = Math.floor(el.scrollTop / 20);
		let index = getElementIndexOfSelection(0);
		index = Math.max(index, topIndex) + scrollLines;
		index = Math.min(index, count - 1);
		select(elements[index]);
	}
	el.scrollBy(0, +scrollLines * 20);
};

const getElementIndexOfSelection = (defIndex: number): number => {
	if (selection instanceof HTMLElement) {
		return elements.indexOf(selection);
	}
	return defIndex;
};

const scrollToSelection = (): void => {
	const el = root.value;
	if (!el) return;
	if (hasScrollBar(el)) {
		const index = elements.indexOf(selection);
		if (index !== -1) {
			const scrollTop = Math.clamp(el.scrollTop, index * 20 + 20 - el.innerHeight, index * 20);
			if (el.scrollTop !== scrollTop) {
				el.scrollTop = scrollTop;
			}
		}
	}
};

const clearElements = (start: number): void => {
	let i = start;
	while (elements[i] !== undefined) {
		elements[i++] = undefined;
	}
};

const clear = (): SelectListElement => {
	const el = root.value!;
	unselect();
	el.textContent = '';
	clearElements(0);
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	updateHeadAndFoot();
	return el;
};

const pointermove = (event: PointerEvent): void => {
	const element = (event.target as HTMLElement).closest('.select-item') as SelectItemElement | null;
	if (element && !hasClass(element, 'selected')) {
		write(element.dataValue);
	}
};

const windowKeydown = (event: KeyboardEvent): void => {
	const el = root.value;
	if (!el) return;
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
				target!.input(value);
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
			el.scroll(0, 0);
			select(elements[0]);
			break;
		}
		case 'End': {
			const last = elements.count - 1;
			el.scroll(0, el.scrollHeight);
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
	const el = root.value;
	if (!el) return;
	switch (event.button) {
		case 0: {
			const t = target!;
			const eventTarget = event.target as HTMLElement;
			if (eventTarget === el) {
				event.preventDefault();
				return;
			}
			if (eventTarget.closest('.select-box') === t) {
				event.stopImmediatePropagation();
				close();
				return;
			}
			const item = eventTarget.closest('.select-item') as SelectItemElement | null;
			if (item && item.parentNode === el) {
				event.preventDefault();
				if (event.altKey) {
					return;
				}
				t.input(item.dataValue);
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
	const el = root.value;
	if (!el) return;
	const MAX_LINES = 30;
	const r = rect(target!);
	const rl = r.left;
	const rt = r.top;
	const rb = r.bottom;
	const rw = r.width;
	const count = elements.count;
	const space = window.innerHeight - rb;
	const below = space >= Math.min(count, 10) * 20;
	const capacity = below ? Math.floor(space / 20) : Math.floor(rt / 20);
	const lines = Math.min(count, capacity, MAX_LINES);
	const top = below ? rb : rt - lines * 20;
	el.style.left = `${rl}px`;
	el.style.top = `${top}px`;
	el.style.width = `calc(${rw}px - var(--2dpx))`;
	el.style.height = `${lines * 20}px`;
	el.style.zIndex = `${(getWindow().frames?.length ?? 0) + 1}`;
};

const windowBlur = (event: Event): void => {
	close();
};

defineExpose({
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
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.tabIndex = 0;
	listenDraggingScrollbarEvent(el);
	on(el, 'scroll', resize as (event: EditorEvent) => void);
	el.read = read;
	el.write = write;
	el.select = select;
	el.unselect = unselect;
	el.reselect = reselect;
	el.open = open;
	el.close = close;
	el.resize = resize;
	el.updateHeadAndFoot = updateHeadAndFoot;
	el.updateOnResize = updateOnResize;
	el.createItems = createItems;
	el.pageUp = pageUp;
	el.pageDown = pageDown;
	el.getElementIndexOfSelection = getElementIndexOfSelection;
	el.scrollToSelection = scrollToSelection;
	el.clearElements = clearElements;
	el.clear = clear;
});
</script>
