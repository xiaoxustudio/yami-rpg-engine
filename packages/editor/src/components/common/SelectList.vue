<template>
	<YMSelectList ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMSelectList } from '@ui-kit';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	read(): any;
	write(value: any): void;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	open(target: HTMLElement & { dataItems: any[]; dataValue: any }): void;
	close(): void;
	resize(): void;
	createItems(items: any[]): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	getElementIndexOfSelection(defIndex: number): number;
	scrollToSelection(): void;
	clearElements(start: number): void;
	clear(): HTMLElement | undefined;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): any => ym.value?.read();
const write = (value: any): void => ym.value?.write(value);
const select = (element: HTMLElement): void => ym.value?.select(element);
const unselect = (): void => ym.value?.unselect();
const reselect = (offset: number): void => ym.value?.reselect(offset);
const open = (target: HTMLElement & { dataItems: any[]; dataValue: any }): void => ym.value?.open(target);
const close = (): void => ym.value?.close();
const resize = (): void => ym.value?.resize();
const createItems = (items: any[]): void => ym.value?.createItems(items);
const pageUp = (selectFlag: boolean): void => ym.value?.pageUp(selectFlag);
const pageDown = (selectFlag: boolean): void => ym.value?.pageDown(selectFlag);
const getElementIndexOfSelection = (defIndex: number): number =>
	ym.value?.getElementIndexOfSelection(defIndex) ?? defIndex;
const scrollToSelection = (): void => ym.value?.scrollToSelection();
const clearElements = (start: number): void => ym.value?.clearElements(start);
const clear = (): HTMLElement | undefined => ym.value?.clear();

defineExpose({
	read,
	write,
	select,
	unselect,
	reselect,
	open,
	close,
	resize,
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
	el.read = read;
	el.write = write;
	el.select = select;
	el.unselect = unselect;
	el.reselect = reselect;
	el.open = open;
	el.close = close;
	el.resize = resize;
	el.createItems = createItems;
	el.pageUp = pageUp;
	el.pageDown = pageDown;
	el.getElementIndexOfSelection = getElementIndexOfSelection;
	el.scrollToSelection = scrollToSelection;
	el.clearElements = clearElements;
	el.clear = clear;
});
</script>
