<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { elementDataOf } from '../../../utils/element-data';
import { addClass, removeClass, hasClass, hide, show, rect } from '../../../utils/dom';
import { createDragAndDropHintElement } from '../YMDragAndDropHint/drag-and-drop-hint-api';
import { createTabBarCore, type TabItem, type TabItemMeta } from './tab-bar-core';
import { createPayloadEvent } from '../../../utils/payload-event';

const core = createTabBarCore();

interface TabHint extends HTMLElement {
	target: HTMLElement;
	position: 'before' | 'after';
	measure(item: HTMLElement): { left: number; top: number; width: number; height: number };
	set(coords: { left: number; top: number; width: number; height: number }): void;
}

interface TabDraggingEvent {
	hint: TabHint | null;
	target: HTMLElement;
	offsetX: number;
	mode?: 'close' | 'popup';
	relate?(event: PointerEvent): boolean;
}

interface TabElement extends HTMLElement {
	item: TabItem;
	text: HTMLElement;
}

interface TabDragTarget extends HTMLElement {
	item: TabItem;
}

type TabBarElement = HTMLElement & {
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
};

interface Props {
	id?: string;
	updateAppRegion?: () => void;
}

interface TabBarElementData {
	dragging: TabDraggingEvent | null;
}
const tabBarData = (el: unknown): TabBarElementData => elementDataOf<TabBarElementData>(el);

interface TabElementData {
	item: TabItem;
}
const tabData = (el: unknown): TabElementData => elementDataOf<TabElementData>(el);

/** 拖拽指示器（本身就是 HTMLElement）的元素数据——`target` 指向当前命中的标签元素 */
const hintData = (el: unknown): { target: HTMLElement | null } =>
	elementDataOf<{ target: HTMLElement | null }>(el);

const props = defineProps<Props>();

const emit = defineEmits<{
	write: [value: TabItem | undefined];
	select: [value: TabItem | undefined];
	closed: [closedItems: TabItem[], lastValue: TabItem | undefined];
	popup: [value: TabItem | null, clientX: number, clientY: number];
}>();

const root = ref<HTMLElement | null>(null);

let selectionIndex = 0;

const read = (): TabItem | undefined => {
	const el = root.value as TabBarElement | null;
	if (!el) return undefined;
	const item = el.querySelector('.selected') as HTMLElement | null;
	return item ? tabData(item).item : undefined;
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
			if (tabData(items[i]).item === value) {
				selectionIndex = i;
				target = items[i] as HTMLElement;
				break;
			}
		}
		if (target !== undefined) {
			addClass(target, 'selected');
		}
		if (el.writeEventEnabled) {
			const writeEvent = createPayloadEvent('write', {} as { value?: TabItem | undefined });
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
			tabData(tab).item = item;
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

const parseTabName = (item: TabItem): string => core.parseTabName(item);

const select = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	if (read() !== item) {
		write(item);
		if (el.selectEventEnabled) {
			const selectEvent = createPayloadEvent('select', {} as { value?: TabItem });
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
	if (core.insertTabItem(data, item, selectionIndex)) {
		update();
	}
};

/**
 * 三条关闭路径（单关 / 关其他 / 关右侧）共用的 `closed` 事件派发：构造 payload、
 * `dispatchEvent`、再 `emit`。原先三处各抄一遍，字段一旦漂移就会不一致。
 */
const emitClosed = (closedItems: TabItem[], lastValue: TabItem | undefined): void => {
	const el = root.value as TabBarElement | null;
	if (!el?.closedEventEnabled) return;
	const closedEvent = createPayloadEvent(
		'closed',
		{} as {
			closedItems: TabItem[];
			lastValue: TabItem | undefined;
		}
	);
	closedEvent.closedItems = closedItems;
	closedEvent.lastValue = lastValue;
	el.dispatchEvent(closedEvent);
	emit('closed', closedEvent.closedItems, closedEvent.lastValue);
};

const close = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	if (item === el.dirItem) return;
	const value = read();
	const data = el.data!;
	if (core.arrayRemove(data, item)) {
		update();
		if (data.length > 0) {
			if (value === item || value === undefined || !data.includes(value)) {
				const index = Math.min(selectionIndex, data.length - 1);
				select(data[index]);
			} else {
				write(value);
			}
		}
		emitClosed([item], value);
	}
};

const closeByProperty = (key: string, value: unknown): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const context = core.findTabByProperty(el.data!, key, value);
	if (context !== undefined) {
		close(context);
	}
};

const closeOtherTabs = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const value = read();
	const items = el.data!;
	if (items.length <= 1) return;
	const closedItems = core.collectOtherTabs(items, item, el.dirItem);
	if (closedItems.length !== 0) {
		update();
		emitClosed(closedItems, value);
	}
};

const closeTabsToTheRight = (item: TabItem): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const value = read();
	const items = el.data!;
	const closedItems = core.collectTabsToTheRight(items, item, el.dirItem);
	if (closedItems.length !== 0) {
		update();
		emitClosed(closedItems, value);
	}
};

const find = (meta: TabItemMeta): TabItem | undefined => {
	const el = root.value as TabBarElement | null;
	if (!el) return undefined;
	// oxlint-disable-next-line no-explicit-any
	for (const node of el.childNodes as NodeListOf<any>) {
		const nodeItem = tabData(node).item;
		if (nodeItem && nodeItem.meta === meta) {
			return nodeItem;
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

/**
 * 一次手势占用的资源统一在这里回收：`dragging` 状态、window 上的 `pointerup` 监听、
 * 以及插到**组件子树之外**（`el.parentNode`）的拖拽提示元素。
 *
 * `dragend`（自然结束）与 `onBeforeUnmount`（拖拽中途卸载）共用它——否则组件的 window 监听
 * 与游离 hint 会永久残留。
 */
const clearGesture = (el: TabBarElement): void => {
	const data = tabBarData(el);
	data.dragging?.hint?.remove();
	data.dragging = null;
	window.removeEventListener('pointerup', windowPointerup);
	removeClass(el, 'dragging');
	el.removeEventListener('dragenter', dragenter);
	el.removeEventListener('dragleave', dragleave);
	el.removeEventListener('dragover', dragover);
	el.removeEventListener('drop', drop);
};

const dragend = (): void => {
	const el = root.value as TabBarElement | null;
	if (!el || !el.parentNode) return;
	if (tabBarData(el).dragging) {
		clearGesture(el);
	}
};

const pointerdown = (event: PointerEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const data = tabBarData(el);
	dragend();
	switch (event.button) {
		case 0: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'tab-close')) {
				event.preventDefault();
				const parent = element.parentNode as HTMLElement;
				const dragging: TabDraggingEvent = {
					hint: null,
					target: parent,
					offsetX: event.offsetX,
					mode: 'close',
					relate(event: PointerEvent): boolean {
						return (event.target as HTMLElement).closest('.tab-item') === parent;
					}
				};
				data.dragging = dragging;
				window.addEventListener('pointerup', windowPointerup);
				return;
			}
			if (hasClass(element, 'tab-item') && !hasClass(element, 'selected')) {
				select(tabData(element).item);
			}
			break;
		}
		case 2:
			if (el.popupEventEnabled) {
				const target = event.target as HTMLElement;
				if (hasClass(target, 'tab-item') || hasClass(target, 'tab-bar')) {
					const dragging: TabDraggingEvent = {
						hint: null,
						target,
						offsetX: event.offsetX,
						mode: 'popup'
					};
					data.dragging = dragging;
					window.addEventListener('pointerup', windowPointerup);
				}
			}
			break;
	}
};

const dragstart = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el || !el.parentNode) return;
	const data = tabBarData(el);
	if (!data.dragging) {
		const hint = createDragAndDropHintElement() as TabHint;
		const dragging: TabDraggingEvent = {
			hint,
			target: event.target as HTMLElement,
			offsetX: event.offsetX
		};
		data.dragging = dragging;
		Object.defineProperty(event, 'offsetX', { writable: true });
		event.preventDefault = (() => {}) as () => void;
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
	const el = root.value as TabBarElement | null;
	if (el && tabBarData(el).dragging) {
		event.preventDefault();
		(event.dataTransfer as { dropEffect: string }).dropEffect = 'move';
	}
};

const dragleave = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const data = tabBarData(el);
	if (data.dragging && !el.contains(event.relatedTarget as Node)) {
		data.dragging.offsetX = -1;
		hide(data.dragging.hint!);
	}
};

const dragover = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const data = tabBarData(el);
	const dragging = data.dragging;
	if (!dragging) return;
	event.preventDefault();
	(event.dataTransfer as { dropEffect: string }).dropEffect = 'move';
	if (dragging.offsetX === event.offsetX) {
		return;
	}
	dragging.offsetX = event.offsetX;
	const element = (event.target as HTMLElement).closest('.tab-item') as HTMLElement | null;
	const hint = dragging.hint!;
	const hintState = hintData(hint);
	show(hint);
	if (element && hasClass(element, 'tab-item')) {
		const sItem = tabData(dragging.target).item;
		const dItem = tabData(element).item;
		if (sItem === dItem) {
			hide(hint);
			return;
		}
		const box = rect(element);
		const position = core.computeDropPosition(event.clientX, box);
		switch (position) {
			case 'before':
				if (hintState.target !== element || hint.position !== position) {
					if (element.previousSibling === dragging.target) {
						hide(hint);
						return;
					}
					hintState.target = element;
					hint.position = position;
					hint.set(core.computeHintRect(hint.measure(element), position));
				}
				break;
			case 'after':
				if (hintState.target !== element || hint.position !== position) {
					if (element.nextSibling === dragging.target) {
						hide(hint);
						return;
					}
					hintState.target = element;
					hint.position = position;
					hint.set(core.computeHintRect(hint.measure(element), position));
				}
				break;
		}
	} else {
		const elements = el.childNodes;
		const index = elements.length - 1;
		const last = elements[index] as HTMLElement;
		if (last === dragging.target) {
			hide(hint);
			return;
		}
		if (last !== undefined && (hintState.target !== last || hint.position !== 'after')) {
			const r = hint.measure(last);
			r.left += r.width - 1;
			r.width = 2;
			hintState.target = last;
			hint.position = 'after';
			hint.set(r);
		}
	}
};

const drop = (event: DragEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const data = tabBarData(el);
	const dragging = data.dragging;
	if (!dragging) return;
	event.stopPropagation();
	const hint = dragging.hint!;
	if (!hasClass(hint, 'hidden')) {
		const items = el.data!;
		const sItem = tabData(dragging.target).item;
		const dItem = tabData(hintData(hint).target).item;
		const dIndex = core.moveTabItem(items, sItem, dItem, hint.position);
		if (dIndex !== null) {
			selectionIndex = dIndex;
			update();
			const selectedEl = el.childNodes[selectionIndex] as HTMLElement | undefined;
			if (selectedEl) {
				addClass(selectedEl, 'selected');
			}
		}
	}
	dragend();
};

const windowPointerup = (event: PointerEvent): void => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	const dragging = tabBarData(el).dragging;
	if (!dragging) return;
	clearGesture(el);
	if (dragging.mode !== 'close' && dragging.mode !== 'popup') return;
	if (dragging.relate && !dragging.relate(event)) return;
	switch (dragging.mode) {
		case 'close': {
			const target = (event.target as HTMLElement).closest(
				'.tab-item'
			) as TabDragTarget | null;
			if (target && dragging.target === target) {
				close(tabData(target).item);
			}
			break;
		}
		case 'popup':
			if (dragging.target === event.target) {
				const popupEvent = createPayloadEvent(
					'popup',
					{} as {
						value?: TabItem | null;
						clientX: number;
						clientY: number;
					}
				);
				const item = tabData(event.target).item;
				popupEvent.value = item ?? null;
				popupEvent.clientX = event.clientX;
				popupEvent.clientY = event.clientY;
				el.dispatchEvent(popupEvent);
				emit('popup', popupEvent.value, popupEvent.clientX, popupEvent.clientY);
			}
			break;
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
	tabBarData(el).dragging = null;
	selectionIndex = 0;
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

onBeforeUnmount(() => {
	const el = root.value as TabBarElement | null;
	if (!el) return;
	clearGesture(el);
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
	display: flex;
	position: relative;
	width: 200px;
	line-height: 28px;
	font-family: var(--font-family-symbol), var(--font-family-title);
	justify-content: space-between;
	background-color: var(--tab-item-background);
	border-right: var(--tab-item-border);
	-webkit-app-region: no-drag;
	white-space: pre;
	cursor: default;
}

:global(:where(.tab-text)) {
	flex-grow: 1;
	width: 0;
	text-indent: 8px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	pointer-events: none;
}

:global(:where(.tab-item:first-child)) {
	border-left: var(--tab-item-border);
}

:global(:where(.tab-item:not(.selected):hover)) {
	background-color: var(--tab-item-background-hover);
}

:global(:where(.tab-item.selected)) {
	color: var(--toolbar-item-color-highlight);
	background-color: var(--tab-item-background-selected);
}

:global(:where(.tab-close)) {
	position: absolute;
	right: 0;
	margin: 4px;
	width: 16px;
	height: 16px;
	line-height: 16px;
	font-size: 10px;
	text-align: center;
	color: var(--tab-close-color);
	pointer-events: auto;
	cursor: pointer;
	border-radius: 50%;
}

:global(:where(.tab-close:hover)) {
	color: var(--tab-close-color-hover);
	background-color: var(--titlebar-button-background-hover);
}

:global(:where(.tab-close:active)) {
	color: var(--tab-close-color-active);
	background-color: var(--titlebar-button-background-active);
}

:global(:where(#title-tabBar)) {
	flex-grow: 1;
	display: flex;
	width: 240px;
	height: 28px;
	overflow: hidden;
	visibility: hidden;
}

:global(:where(#title-tabBar.visible)) {
	visibility: visible;
}

:global(:where(.tab-bar.dragging)) {
	-webkit-app-region: no-drag;
}
</style>
