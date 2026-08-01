<template>
	<common-list ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement
} from '@/util/element-utils';

interface CommonListElement extends HTMLElement {
	read(): any;
	write(value: any): void;
	reload(): CommonListElement;
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
	clear(): CommonListElement;
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

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const reload = (): CommonListElement | undefined => root.value?.reload();
const appendElement = (element: HTMLElement): void => root.value?.appendElement(element);
const update = (): void => root.value?.update();
const resize = (): void => root.value?.resize();
const updateHeadAndFoot = (): void => root.value?.updateHeadAndFoot();
const updateOnResize = (element?: HTMLElement): void => root.value?.updateOnResize(element);
const select = (element: HTMLElement): void => root.value?.select(element);
const unselect = (): void => root.value?.unselect();
const scrollToItem = (index: number): void => root.value?.scrollToItem(index);
const selectRelative = (direction: 'up' | 'down'): void => root.value?.selectRelative(direction);
const clearElements = (start: number): void => root.value?.clearElements(start);
const clear = (): CommonListElement | undefined => (root.value ? clearElement(root.value) : undefined);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
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
	el.on('write', (e: any) => emit('write', e.value));
	el.on('select', (e: any) => emit('select', e.value));
	el.on('popup', (e: any) => emit('popup', e.value, e.clientX, e.clientY));
});
</script>
