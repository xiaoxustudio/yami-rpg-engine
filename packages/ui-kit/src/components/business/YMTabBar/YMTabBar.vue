<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	addClass,
	removeClass,
	hasClass,
	hide,
	show,
	rect
} from '../../../utils/dom';
import { createDragAndDropHintElement } from '../YMDragAndDropHint/drag-and-drop-hint-api';

const arrayRemove = (arr: TabItem[], item: TabItem): boolean => {
	const index = arr.indexOf(item);
	if (index !== -1) {
		arr.splice(index, 1);
		return true;
	}
	return false;
};

interface TabHint extends HTMLElement {
	target: HTMLElement;
	position: 'before' | 'after';
	measure(item: HTMLElement): { left: number; top: number; width: number; height: number };
	set(coords: { left: number; top: number; width: number; height: number }): void;
}

interface TabDraggingEvent {
	hint: TabHint;
	target: HTMLElement;
	offsetX: number;
	mode?: 'close' | 'popup';
	relate?(event: PointerEvent): boolean;
}

interface TabItemMeta {
	guid?: string;
	path?: string;
	[k: string]: unknown;
}

interface TabItem {
	item?: string;
	icon: string;
	name: string;
	type?: string;
	meta?: TabItemMeta;
	tab?: HTMLElement;
	[k: string]: unknown;
}

interface TabElement extends HTMLElement {
	item: TabItem;
	text: HTMLElement;
}

interface TabDragTarget extends HTMLElement {
	item: TabItem;
}

interface TabBarElement extends HTMLElement {
	data?: TabItem[] | null;
	dirItem?: TabItem | null;
	selectionIndex?: number;
	writeEventEnabled?: boolean;
	selectEventEnabled?: boolean;
	closedEventEnabled?: boolean;
	popupEventEnabled?: boolean;
	dragging?: TabDraggingEvent | null;
	windowPointerup?: (event: PointerEvent) => void;
	read?: () => TabItem | undefined;
	write?: (value: TabItem | undefined) => void;
	update?: () => void;
	parseTabName?: (item: TabItem) => string;
	select?: (item: TabItem) => void;
	unselect?: () => void;
	insert?: (item: TabItem) => void;
	close?: (item: TabItem) => void;
	closeByProperty?: (key: string, value: unknown) => void;
	closeOtherTabs?: (item: TabItem) => void;
	closeTabsToTheRight?: (item: TabItem) => void;
	find?: (meta: TabItemMeta) => TabItem | undefined;
	clear?: () => void;
	on?: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
}

interface Props {
	id?: string;
	updateAppRegion?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
	updateAppRegion: null as unknown as () => void
});

const emit = defineEmits<{
	write: [value: TabItem | undefined];
	select: [value: TabItem | undefined];
	closed: [closedItems: TabItem[], lastValue: TabItem | undefined];
	popup: [value: TabItem | null, clientX: number, clientY: number];
}>();

const root = ref<HTMLElement | null>(null);

const read = (): TabItem | undefined => {
	const el = root.value as TabBarElement | null;
	if (!el) return undefined;
	const item = el.querySelector('.selected') as HTMLElement | null;
	return item ? (item as TabElement).item : undefined;
};

const write = (value: TabItem | undefined): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const items = el.childNodes;
	const length = items.length;
	if (length !== 0) {
		unselect();
		let target: HTMLElement | undefined;
		for (let i = 0; i < length; i++) {
			if ((items[i] as TabElement).item === value) {
				el.selectionIndex = i;
				target = items[i] as HTMLElement;
				break;
			}
		}
		if (target !== undefined) {
			addClass(target, 'selected');
		}
		if (el.writeEventEnabled) {
			const writeEvent = new Event('write') as Event & { value?: TabItem | undefined };
			writeEvent.value = target ? value : undefined;
			el.dispatchEvent(writeEvent);
			emit('write', writeEvent.value);
		}
	}
};

const update = (): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	clear();
	for (const item of el.data!) {
		let tab = item.tab;
		if (tab === undefined) {
			tab = item.tab = document.createElement('div');
			addClass(tab, 'tab-item');
			const text = document.createElement('div');
			addClass(text, 'tab-text');
			text.textContent = parseTabName(item);
			(tab as HTMLElement & { draggable: boolean }).draggable = true;
			(tab as TabElement).item = item;
			(tab as TabElement & { text: HTMLElement }).text = text;
			tab.appendChild(text);
			if (item.type !== 'directory') {
				const mark = document.createElement('div');
				addClass(mark, 'tab-close');
				mark.textContent = '\u2716';
				tab.appendChild(mark);
			}
		}
		el.appendChild(tab);
	}
};

const parseTabName = (item: TabItem): string => `${item.icon} ${item.name}`;

const select = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	if (read() !== item) {
		write(item);
		if (el.selectEventEnabled) {
			const selectEvent = new Event('select') as Event & { value?: TabItem };
			selectEvent.value = item;
			el.dispatchEvent(selectEvent);
			emit('select', selectEvent.value);
		}
	}
};

const unselect = (): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const item = el.querySelector('.selected') as HTMLElement | null;
	if (item) {
		removeClass(item, 'selected');
	}
};

const insert = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const data = el.data!;
	if (!data.includes(item)) {
		data.splice(el.selectionIndex! + 1, 0, item);
		update();
	}
};

const close = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	if (item === el.dirItem) return;
	const value = read();
	const data = el.data!;
	if (arrayRemove(data, item)) {
		update();
		if (data.length > 0) {
			if (value === item || value === undefined || !data.includes(value)) {
				const index = Math.min(el.selectionIndex!, data.length - 1);
				select(data[index]);
			} else {
				write(value);
			}
		}
		if (el.closedEventEnabled) {
			const closedEvent = new Event('closed') as Event & {
				closedItems: TabItem[];
				lastValue: TabItem | undefined;
			};
			closedEvent.closedItems = [item];
			closedEvent.lastValue = value;
			el.dispatchEvent(closedEvent);
			emit('closed', closedEvent.closedItems, closedEvent.lastValue);
		}
	}
};

const closeByProperty = (key: string, value: unknown): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	for (const context of el.data!) {
		if (context[key] === value) {
			close(context);
			return;
		}
	}
};

const closeOtherTabs = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const value = read();
	const items = el.data!;
	let i = items.length;
	if (i <= 1) return;
	const closedItems: TabItem[] = [];
	while (--i >= 0) {
		const tab = items[i];
		if (tab === item) continue;
		if (tab === el.dirItem) continue;
		items.splice(i, 1);
		closedItems.push(tab);
	}
	if (closedItems.length !== 0) {
		update();
		if (el.closedEventEnabled) {
			const closedEvent = new Event('closed') as Event & {
				closedItems: TabItem[];
				lastValue: TabItem | undefined;
			};
			closedEvent.closedItems = closedItems;
			closedEvent.lastValue = value;
			el.dispatchEvent(closedEvent);
			emit('closed', closedEvent.closedItems, closedEvent.lastValue);
		}
	}
};

const closeTabsToTheRight = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const value = read();
	const items = el.data!;
	const index = items.indexOf(item);
	if (index === -1) return;
	const closedItems: TabItem[] = [];
	let i = items.length;
	while (--i > index) {
		const tab = items[i];
		if (tab === el.dirItem) continue;
		items.splice(i, 1);
		closedItems.push(tab);
	}
	if (closedItems.length !== 0) {
		update();
		if (el.closedEventEnabled) {
			const closedEvent = new Event('closed') as Event & {
				closedItems: TabItem[];
				lastValue: TabItem | undefined;
			};
			closedEvent.closedItems = closedItems;
			closedEvent.lastValue = value;
			el.dispatchEvent(closedEvent);
			emit('closed', closedEvent.closedItems, closedEvent.lastValue);
		}
	}
};

const find = (meta: TabItemMeta): TabItem | undefined => {
	const el = root.value as TabBarElement | null;
	if (!el) return undefined;
	for (const node of el.childNodes as unknown as NodeListOf<any>) {
		if (node.item && node.item.meta === meta) {
			return node.item;
		}
	}
	return undefined;
};

const clear = (): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	unselect();
	el.textContent = '';
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	switch (type) {
		case 'write':
			el.writeEventEnabled = true;
			break;
		case 'select':
			el.selectEventEnabled = true;
			break;
		case 'closed':
			el.closedEventEnabled = true;
			break;
		case 'popup':
			el.popupEventEnabled = true;
			break;
	}
};

const dragend = (): void => {
	const el = root.value as TabBarElement | null;
	if (!el || !el.parentNode) return;
	if (el.dragging) {
		removeClass(el, 'dragging');
		el.parentNode.removeChild(el.dragging.hint);
		el.dragging = null;
		el.removeEventListener('dragenter', dragenter);
		el.removeEventListener('dragleave', dragleave);
		el.removeEventListener('dragover', dragover);
		el.removeEventListener('drop', drop);
	}
};

const pointerdown = (event: PointerEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	dragend();
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'tab-close')) {
				event.preventDefault();
				const parent = element.parentNode as HTMLElement;
				const dragging: TabDraggingEvent = {
					hint: null as unknown as TabHint,
					target: parent,
					offsetX: event.offsetX,
					mode: 'close',
					relate(event: PointerEvent): boolean {
						return (event.target as HTMLElement).closest('.tab-item') === parent;
					}
				};
				el.dragging = dragging;
				window.addEventListener('pointerup', windowPointerup);
				return;
			}
			if (hasClass(element, 'tab-item') && !hasClass(element, 'selected')) {
				select((element as TabElement).item);
			}
			break;
		}
		case 2:
			if (el.popupEventEnabled) {
				const target = event.target as HTMLElement;
				if (hasClass(target, 'tab-item') || hasClass(target, 'tab-bar')) {
					const dragging: TabDraggingEvent = {
						hint: null as unknown as TabHint,
						target,
						offsetX: event.offsetX,
						mode: 'popup'
					};
					el.dragging = dragging;
					window.addEventListener('pointerup', windowPointerup);
				}
			}
			break;
	}
};

const dragstart = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el || !el.parentNode) return;
	if (!el.dragging) {
		const hint = createDragAndDropHintElement() as unknown as TabHint;
		const dragging: TabDraggingEvent = {
			hint,
			target: event.target as HTMLElement,
			offsetX: event.offsetX
		};
		el.dragging = dragging;
		Object.defineProperty(event, 'offsetX', { writable: true });
		event.preventDefault = (() => {}) as unknown as () => void;
		(event.dataTransfer as unknown as { hideDragImage(): void }).hideDragImage();
		addClass(hint, 'for-tab');
		el.parentNode.insertBefore(hide(hint), el);
		addClass(el, 'dragging');
		props.updateAppRegion?.();
		el.addEventListener('dragenter', dragenter);
		el.addEventListener('dragleave', dragleave);
		el.addEventListener('dragover', dragover);
		el.addEventListener('drop', drop);
	}
};

const dragenter = (event: DragEvent): void => {
	if ((root.value as TabBarElement | null)?.dragging) {
		event.preventDefault();
		(event.dataTransfer as unknown as { dropEffect: string }).dropEffect = 'move';
	}
};

const dragleave = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	if (el.dragging && !el.contains(event.relatedTarget as Node)) {
		el.dragging.offsetX = -1;
		hide(el.dragging.hint);
	}
};

const dragover = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el || !el.dragging) return;
	event.preventDefault();
	(event.dataTransfer as unknown as { dropEffect: string }).dropEffect = 'move';
	if (el.dragging.offsetX === event.offsetX) {
		return;
	}
	el.dragging.offsetX = event.offsetX;
	const element = (event.target as HTMLElement).closest('.tab-item') as HTMLElement | null;
	const hint = el.dragging.hint;
	show(hint);
	if (element && hasClass(element, 'tab-item')) {
		const sItem = (el.dragging.target as TabDragTarget).item;
		const dItem = (element as TabElement).item;
		if (sItem === dItem) {
			hide(hint);
			return;
		}
		const box = rect(element);
		const middle = box.width / 2;
		const offsetX = event.clientX - box.left;
		const position = offsetX < middle ? 'before' : 'after';
		switch (position) {
			case 'before':
				if (hint.target !== element || hint.position !== position) {
					if (element.previousSibling === el.dragging.target) {
						hide(hint);
						return;
					}
					const r = hint.measure(element);
					r.left -= 1;
					r.width = 2;
					hint.target = element;
					hint.position = position;
					hint.set(r);
				}
				break;
			case 'after':
				if (hint.target !== element || hint.position !== position) {
					if (element.nextSibling === el.dragging.target) {
						hide(hint);
						return;
					}
					const r = hint.measure(element);
					r.left += r.width - 1;
					r.width = 2;
					hint.target = element;
					hint.position = position;
					hint.set(r);
				}
				break;
		}
	} else {
		const elements = el.childNodes;
		const index = elements.length - 1;
		const last = elements[index] as HTMLElement;
		if (last === el.dragging.target) {
			hide(hint);
			return;
		}
		if (last !== undefined && (hint.target !== last || hint.position !== 'after')) {
			const r = hint.measure(last);
			r.left += r.width - 1;
			r.width = 2;
			hint.target = last;
			hint.position = 'after';
			hint.set(r);
		}
	}
};

const drop = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el || !el.dragging) return;
	event.stopPropagation();
	const hint = el.dragging.hint;
	if (!hasClass(hint, 'hidden')) {
		const items = el.data!;
		const sItem = (el.dragging.target as TabDragTarget).item;
		const dItem = (hint.target as TabDragTarget).item;
		if (arrayRemove(items, sItem)) {
			let dIndex = items.indexOf(dItem);
			if (hint.position === 'after') {
				dIndex++;
			}
			items.splice(dIndex, 0, sItem);
			el.selectionIndex = dIndex;
			update();
		}
	}
	dragend();
};

const windowPointerup = (event: PointerEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	if (el.dragging && el.dragging.relate!(event)) {
		switch (el.dragging.mode) {
			case 'close': {
				const target = (event.target as HTMLElement).closest('.tab-item') as TabDragTarget | null;
				if (target && el.dragging.target === target) {
					close(target.item);
				}
				break;
			}
			case 'popup':
				if (el.dragging.target === event.target) {
					const popupEvent = new Event('popup') as Event & {
						value?: TabItem | null;
						clientX: number;
						clientY: number;
					};
					const item = (event.target as TabElement).item;
					popupEvent.value = item ?? null;
					popupEvent.clientX = event.clientX;
					popupEvent.clientY = event.clientY;
					el.dispatchEvent(popupEvent);
					emit('popup', popupEvent.value, popupEvent.clientX, popupEvent.clientY);
				}
				break;
		}
		el.dragging = null;
		window.removeEventListener('pointerup', windowPointerup);
	}
};

defineExpose({
	read,
	write,
	update,
	parseTabName,
	select,
	unselect,
	insert,
	close,
	closeByProperty,
	closeOtherTabs,
	closeTabsToTheRight,
	find,
	clear,
	on,
	root
});

onMounted(() => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	el.data = null;
	el.dragging = null;
	el.selectionIndex = 0;
	el.writeEventEnabled = false;
	el.selectEventEnabled = false;
	el.closedEventEnabled = false;
	el.popupEventEnabled = false;
	el.dirItem = null;
	el.windowPointerup = windowPointerup;
	el.read = read;
	el.write = write;
	el.update = update;
	el.parseTabName = parseTabName;
	el.select = select;
	el.unselect = unselect;
	el.insert = insert;
	el.close = close;
	el.closeByProperty = closeByProperty;
	el.closeOtherTabs = closeOtherTabs;
	el.closeTabsToTheRight = closeTabsToTheRight;
	el.find = find;
	el.clear = clear;
	el.on = on;
	el.addEventListener('pointerdown', pointerdown);
	el.addEventListener('dragstart', dragstart);
	el.addEventListener('dragend', dragend);
});
</script>

<template>
	<div ref="root" class="tab-bar" :id="props.id" />
</template>

<style module>
:global(:where(.tab-bar)) {
	display: block;
	position: relative;
	user-select: none;
}

:global(:where(.tab-item)) {
	display: inline-block;
	position: relative;
	white-space: pre;
	cursor: default;
}

:global(:where(.tab-close)) {
	position: absolute;
	right: 0;
	width: 16px;
	height: 16px;
	text-align: center;
	pointer-events: auto;
	cursor: pointer;
}
</style>
