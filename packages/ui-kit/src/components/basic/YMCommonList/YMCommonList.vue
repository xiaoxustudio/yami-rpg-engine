<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { hasClass, seek } from '../../../utils/dom';
import { attachApi } from '../../../utils/attach-api';
import { elementDataOf } from '../../../utils/element-data';
import { createCommonListCore, type RelativeDirection } from './common-list-core';
import { createPayloadEvent } from '../../../utils/payload-event';

const core = createCommonListCore();

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
	write: [value: unknown];
	select: [value: unknown];
	popup: [value: unknown, clientX: number, clientY: number];
}>();

const root = ref<HTMLElement | null>(null);

interface ListData {
	versionId: number;
	count: number;
	start: number;
	end: number;
	head: HTMLElement | null;
	foot: HTMLElement | null;
}

type ListItem = HTMLElement & {
	dataValue?: unknown;
	versionId?: number;
};

// P4b：common-item 元素上的 `dataValue`（该项承载的值）走显式元素数据
interface ListItemData {
	dataValue?: unknown;
}

const itemData = (el: unknown): ListItemData => elementDataOf<ListItemData>(el);

// 手法库第 4 条（「断言完紧接着写字段」）：改用 `Object.assign([], {…})` 一次成型 ⇒ **零断言**。
// 原来是 `[] as unknown as ListItem[] & ListData`，紧接着 6 行逐字段赋值。
const elements: ListItem[] & ListData = Object.assign([], {
	versionId: 0,
	count: 0,
	start: -1,
	end: -1,
	head: null,
	foot: null
});
let selection: HTMLElement | null = null;
let writeEventEnabled = false;
let selectEventEnabled = false;
let popupEventEnabled = false;

const read = (): unknown => (selection === null ? undefined : itemData(selection).dataValue);

const write = (value: unknown): void => {
	const el = root.value;
	if (!el || elements.count === 0) return;
	unselect();
	const index = core.findItemIndex(elements, elements.count, value);
	const target = elements[index];
	target.classList.add('selected');
	selection = target;
	scrollToItem(index);
	const targetData = itemData(target);
	if (writeEventEnabled) {
		const writeEvent = createPayloadEvent('write', {} as { value: unknown });
		writeEvent.value = targetData.dataValue;
		el.dispatchEvent(writeEvent);
	}
	emit('write', targetData.dataValue);
};

const reload = (): HTMLElement => {
	elements.start = -1;
	elements.count = 0;
	return root.value as HTMLElement;
};

const appendElement = (element: HTMLElement): void => {
	elements[elements.count++] = element;
};

const update = (): void => {
	clearElements(elements.count);
	resize();
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
		const padded = !!(el as HTMLElement & { padded?: boolean }).padded;
		const margins = core.computeHeadAndFootMargins(count, start, end, padded);
		elements.head = elements[start];
		elements.head!.style.marginTop = `${margins.marginTop}px`;
		elements.foot = elements[end - 1];
		elements.foot!.style.marginBottom = `${margins.marginBottom}px`;
	}
};

const resize = (): void => {
	const el = root.value;
	if (!el) return;
	const st = el.scrollTop;
	const ch = el.clientHeight;
	const count = elements.count;
	if (ch === 0) return;
	if (count === 0) {
		el.textContent = '';
		return;
	}
	const range = core.computeVisibleRange(st, ch, count);
	if (elements.start !== range.start || elements.end !== range.end) {
		elements.start = range.start;
		elements.end = range.end;
		updateHeadAndFoot();
		const versionId = elements.versionId++;
		for (let i = range.start; i < range.end; i++) {
			const element = elements[i];
			elementDataOf<{ versionId?: number }>(element).versionId = versionId;
			updateOnResize(element);
		}
		const nodes = el.childNodes;
		const last = nodes.length - 1;
		for (let i = last; i >= 0; i--) {
			const element = nodes[i] as ListItem;
			if (elementDataOf<{ versionId?: number }>(element).versionId !== versionId) {
				element.remove();
			}
		}
		if (elements.foot && !elements.foot.parentNode) {
			el.appendChild(elements.foot);
		}
		for (let i = range.end - 2; i >= range.start; i--) {
			const element = elements[i];
			if (element.parentNode === null) {
				const next = elements[i + 1];
				el.insertBefore(element, next);
			}
		}
	}
};

const updateOnResize = (_element?: HTMLElement): void => {};

const select = (element: HTMLElement): void => {
	if (element instanceof HTMLElement && selection !== element) {
		const elementData = itemData(element);
		write(elementData.dataValue);
		if (selectEventEnabled) {
			const selectEvent = createPayloadEvent('select', {} as { value: unknown });
			selectEvent.value = elementData.dataValue;
			root.value!.dispatchEvent(selectEvent);
		}
		emit('select', elementData.dataValue);
	}
};

const unselect = (): void => {
	if (selection) {
		selection.classList.remove('selected');
		selection = null;
	}
};

const scrollToItem = (index: number): void => {
	const el = root.value;
	if (!el) return;
	const scrollTop = core.computeItemScrollTop(el.scrollTop, index, el.clientHeight);
	if (el.scrollTop !== scrollTop) {
		el.scrollTop = scrollTop;
	}
};

const selectRelative = (direction: RelativeDirection): void => {
	const count = elements.count;
	if (count > 0) {
		let index = -1;
		if (selection) {
			index = Array.prototype.indexOf.call(elements, selection);
		}
		select(elements[core.computeRelativeIndex(direction, count, index)]);
	}
};

const clearElements = (start: number): void => {
	core.clearElements(elements, start);
};

const clear = (): HTMLElement => {
	const el = root.value as HTMLElement;
	unselect();
	el.textContent = '';
	clearElements(0);
	elements.count = 0;
	elements.start = -1;
	elements.end = -1;
	updateHeadAndFoot();
	return el;
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener, options);
	switch (type) {
		case 'write':
			writeEventEnabled = true;
			break;
		case 'select':
			selectEventEnabled = true;
			break;
		case 'popup':
			popupEventEnabled = true;
			break;
	}
};

const onScroll = (): void => {
	resize();
};

const keydown = (event: KeyboardEvent): void => {
	const el = root.value;
	if (!el) return;
	const cmdOrCtrlKey = event.ctrlKey || event.metaKey;
	if (cmdOrCtrlKey) {
		switch (event.code) {
			case 'ArrowUp':
				el.scrollTop -= 20;
				break;
			case 'ArrowDown':
				el.scrollTop += 20;
				break;
		}
	} else if (event.altKey) {
		return;
	} else {
		switch (event.code) {
			case 'Space':
				event.preventDefault();
				return;
			case 'ArrowUp':
				event.preventDefault();
				selectRelative('up');
				break;
			case 'ArrowDown':
				event.preventDefault();
				selectRelative('down');
				break;
		}
	}
};

const pointerdown = (event: PointerEvent): void => {
	switch (event.button) {
		case 0:
		case 2: {
			const element = event.target as HTMLElement;
			if (hasClass(element, 'common-item') && !hasClass(element, 'selected')) {
				select(element);
			}
			break;
		}
	}
};

const pointerup = (event: PointerEvent): void => {
	const el = root.value;
	if (!el) return;
	switch (event.button) {
		case 2:
			if (popupEventEnabled && document.activeElement === el) {
				const element = seek(event.target as HTMLElement, '.common-item');
				if (element && hasClass(element, 'common-item') && hasClass(element, 'selected')) {
					const popup = createPayloadEvent(
						'popup',
						{} as {
							value: unknown;
							clientX: number;
							clientY: number;
						}
					);
					popup.value = itemData(element).dataValue;
					popup.clientX = event.clientX;
					popup.clientY = event.clientY;
					el.dispatchEvent(popup);
					emit('popup', popup.value, popup.clientX, popup.clientY);
				} else {
					const popup = createPayloadEvent(
						'popup',
						{} as {
							value: unknown;
							clientX: number;
							clientY: number;
						}
					);
					popup.value = null;
					popup.clientX = event.clientX;
					popup.clientY = event.clientY;
					el.dispatchEvent(popup);
					emit('popup', popup.value, popup.clientX, popup.clientY);
				}
			}
			break;
	}
};

defineExpose({
	read,
	write,
	reload,
	appendElement,
	update,
	resize,
	updateHeadAndFoot,
	updateOnResize,
	select,
	unselect,
	scrollToItem,
	selectRelative,
	clearElements,
	clear,
	on,
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.tabIndex = 0;
	el.addEventListener('scroll', onScroll);
	el.addEventListener('keydown', keydown);
	el.addEventListener('pointerdown', pointerdown);
	el.addEventListener('pointerup', pointerup);
	attachApi(el, {
		read,
		write,
		reload,
		appendElement,
		update,
		resize,
		updateHeadAndFoot,
		updateOnResize,
		select,
		unselect,
		scrollToItem,
		selectRelative,
		clearElements,
		clear,
		on
	});
});
</script>

<template>
	<div ref="root" class="common-list" :class="$style.list" :id="props.id" />
</template>

<style module>
.list {
	display: block;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	user-select: none;
}

:global(:where(.common-list)) {
	overflow-x: hidden;
	overflow-y: auto;
}

:global(:where(.common-item)) {
	display: block;
	padding: 0 10px;
	height: 20px;
	line-height: 20px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.common-item:hover)) {
	background-color: var(--list-item-background-hover);
}

:global(:where(.common-list:focus > .common-item.selected)) {
	color: white;
	background-color: var(--selected-background);
}

:global(:where(.common-list:not(:focus) > .common-item.selected)) {
	background-color: var(--selected-background-blur);
}

:global(:where(.field-set > .common-list)) {
	position: absolute;
	padding: 10px 0;
	width: 100%;
	height: 100%;
}
</style>
