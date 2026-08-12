<template>
	<YMCommonList ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMCommonList } from '@ui-kit';
import { listenDraggingScrollbarEvent } from '@/util/element-utils';
import { attachElementApi } from '@/utils/attach-element-api';

interface CommonListElement extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
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
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	write: [value: unknown];
	select: [value: unknown];
	popup: [value: unknown, clientX: number, clientY: number];
}>();

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
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
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): unknown => ym.value?.read();
const write = (value: unknown): void => ym.value?.write(value);
const reload = (): HTMLElement => ym.value?.reload() as HTMLElement;
const appendElement = (element: HTMLElement): void => ym.value?.appendElement(element);
const update = (): void => ym.value?.update();
const resize = (): void => ym.value?.resize();
const updateHeadAndFoot = (): void => ym.value?.updateHeadAndFoot();
const updateOnResize = (element?: HTMLElement): void => ym.value?.updateOnResize(element);
const select = (element: HTMLElement): void => ym.value?.select(element);
const unselect = (): void => ym.value?.unselect();
const scrollToItem = (index: number): void => ym.value?.scrollToItem(index);
const selectRelative = (direction: 'up' | 'down'): void => ym.value?.selectRelative(direction);
const clearElements = (start: number): void => ym.value?.clearElements(start);
const clear = (): HTMLElement => ym.value?.clear() as HTMLElement;
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

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
	const el = root.value as CommonListElement | null;
	if (!el) return;
	el.tabIndex = 0;
	listenDraggingScrollbarEvent(el);
	attachElementApi(el, {
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
	on('write', (e: Event & { value?: unknown }) => emit('write', e.value));
	on('select', (e: Event & { value?: unknown }) => emit('select', e.value));
	on('popup', (e: Event & { value?: unknown; clientX: number; clientY: number }) =>
		emit('popup', e.value, e.clientX, e.clientY)
	);
});
</script>
