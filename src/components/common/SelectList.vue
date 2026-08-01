<template>
	<select-list ref="root" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement
} from '@/util/element-utils';

interface SelectListElement extends HTMLElement {
	read(): any;
	write(value: any): void;
	input(value: any): void;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	open(target: any): void;
	close(): void;
	resize(): void;
	createItems(items: Array<{ value: any; name: string; tip?: string }>): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	scrollToSelection(): void;
	clear(): this;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const emit = defineEmits<{
	input: [value: any];
}>();

const root = ref<SelectListElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const input = (value: any): void => root.value?.input(value);
const select = (element: HTMLElement): void => root.value?.select(element);
const unselect = (): void => root.value?.unselect();
const reselect = (offset: number): void => root.value?.reselect(offset);
const open = (target: any): void => root.value?.open(target);
const close = (): void => root.value?.close();
const resize = (): void => root.value?.resize();
const createItems = (
	items: Array<{ value: any; name: string; tip?: string }>
): void => root.value?.createItems(items);
const pageUp = (select: boolean): void => root.value?.pageUp(select);
const pageDown = (select: boolean): void => root.value?.pageDown(select);
const scrollToSelection = (): void => root.value?.scrollToSelection();
const clear = (): SelectListElement | undefined => (root.value ? clearElement(root.value) : undefined);

defineExpose({
	read,
	write,
	input,
	select,
	unselect,
	reselect,
	open,
	close,
	resize,
	createItems,
	pageUp,
	pageDown,
	scrollToSelection,
	clear,
	root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('input', (e: any) => emit('input', e.value));
});
</script>
