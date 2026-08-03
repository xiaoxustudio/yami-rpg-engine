<template>
	<div class="common-list" ref="root" :id="props.id"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	on as onElement,
	addClass,
	removeClass,
	hasClass,
	seek,
	listenDraggingScrollbarEvent
} from '@/util/element-utils';

interface CommonListElement extends HTMLElement {
	read(): any;
	write(value: any): void;
	reload(): HTMLElement;
	appendElement(element: HTMLElement): void;
	update(): void;
	resize(): void;
	updateHeadAndFoot(): void;
	updateOnResize(element?: HTMLElement): void;
	select(element: HTMLElement): void;
	unselect(): void;
	scrollToItem(index: number): void;
	selectRelative(direction: 'up' | 'down'): void;
	clearElements(start: number): void;
	clear(): HTMLElement;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	write: [value: any];
	select: [value: any];
	popup: [value: any, clientX: number, clientY: number];
}>();

const root = ref<CommonListElement | null>(null);

interface ListData {
	versionId: number;
	count: number;
	start: number;
	end: number;
	head: HTMLElement | null;
	foot: HTMLElement | null;
}

let elements = [] as any[] & ListData;
elements.versionId = 0;
elements.count = 0;
elements.start = -1;
elements.end = -1;
elements.head = null;
elements.foot = null;
let selection: HTMLElement | null = null;
let writeEventEnabled = false;
let selectEventEnabled = false;
let popupEventEnabled = false;

const read = (): any => selection?.dataValue;

const write = (value: any): void => {
	const el = root.value;
	if (!el || elements.count === 0) return;
	unselect();
	let index = 0;
	let target = elements[index];
	for (let i = 0; i < elements.count; i++) {
		if (elements[i].dataValue === value) {
			target = elements[(index = i)];
			break;
		}
	}
	addClass(target, 'selected');
	selection = target;
	scrollToItem(index);
	if (writeEventEnabled) {
		const write: any = new Event('write');
		write.value = target.dataValue;
		el.dispatchEvent(write);
	}
	emit('write', target.dataValue);
};

const reload = (): CommonListElement => {
	elements.start = -1;
	elements.count = 0;
	return root.value!;
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

const select = (element: HTMLElement): void => {
	if (element instanceof HTMLElement && selection !== element) {
		write((element as HTMLElement & { dataValue: any }).dataValue);
		if (selectEventEnabled) {
			const select: any = new Event('select');
			select.value = (element as HTMLElement & { dataValue: any }).dataValue;
			root.value!.dispatchEvent(select);
		}
		emit('select', (element as HTMLElement & { dataValue: any }).dataValue);
	}
};

const unselect = (): void => {
	if (selection) {
		removeClass(selection, 'selected');
		selection = null;
	}
};

const scrollToItem = (index: number): void => {
	const el = root.value;
	if (!el) return;
	const scrollTop = Math.clamp(el.scrollTop, index * 20 + 20 - el.innerHeight, index * 20);
	if (el.scrollTop !== scrollTop) {
		el.scrollTop = scrollTop;
	}
};

const selectRelative = (direction: 'up' | 'down'): void => {
	const count = elements.count;
	if (count > 0) {
		let index = -1;
		const last = count - 1;
		if (selection) {
			index = elements.indexOf(selection);
		}
		switch (direction) {
			case 'up':
				if (index !== -1) {
					index = Math.max(index - 1, 0);
				} else {
					index = last;
				}
				break;
			case 'down':
				if (index !== -1) {
					index = Math.min(index + 1, last);
				} else {
					index = 0;
				}
				break;
		}
		select(elements[index]);
	}
};

const clearElements = (start: number): void => {
	let i = start;
	while (elements[i] !== undefined) {
		elements[i++] = undefined;
	}
};

const clear = (): CommonListElement => {
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

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
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
	if (event.cmdOrCtrlKey) {
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
			if (element.tagName === 'COMMON-ITEM' && !hasClass(element, 'selected')) {
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
				const element = seek(event.target as HTMLElement, 'common-item')!;
				if (element.tagName === 'COMMON-ITEM' && hasClass(element, 'selected')) {
					const popup: any = new Event('popup');
					popup.value = (element as HTMLElement & { dataValue: any }).dataValue;
					popup.clientX = event.clientX;
					popup.clientY = event.clientY;
					el.dispatchEvent(popup);
					emit('popup', popup.value, popup.clientX, popup.clientY);
				} else {
					const popup: any = new Event('popup');
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
	listenDraggingScrollbarEvent(el);
	onElement(el, 'scroll', onScroll);
	onElement(el, 'keydown', keydown as (event: EditorEvent) => void);
	onElement(el, 'pointerdown', pointerdown as (event: EditorEvent) => void);
	onElement(el, 'pointerup', pointerup as (event: EditorEvent) => void);
	el.read = read;
	el.write = write;
	el.reload = reload;
	el.appendElement = appendElement;
	el.update = update;
	el.resize = resize;
	el.updateHeadAndFoot = updateHeadAndFoot;
	el.updateOnResize = updateOnResize;
	el.select = select;
	el.unselect = unselect;
	el.scrollToItem = scrollToItem;
	el.selectRelative = selectRelative;
	el.clearElements = clearElements;
	el.clear = clear;
	el.on = on;
});
</script>
