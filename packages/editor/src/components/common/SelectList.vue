<template>
	<YMSelectList ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMSelectList, type SelectItem } from '@ui-kit';
import { attachElementApi } from '@/utils/attach-element-api';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	select(element: HTMLElement): void;
	unselect(): void;
	reselect(offset: number): void;
	open(target: HTMLElement & { dataItems: SelectItem[]; dataValue: unknown }): void;
	close(): void;
	resize(): void;
	createItems(items: SelectItem[]): void;
	pageUp(select: boolean): void;
	pageDown(select: boolean): void;
	getElementIndexOfSelection(defIndex: number): number;
	scrollToSelection(): void;
	clearElements(start: number): void;
	clear(): HTMLElement | undefined;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): unknown => ym.value?.read();
const write = (value: unknown): void => ym.value?.write(value);
const select = (element: HTMLElement): void => ym.value?.select(element);
const unselect = (): void => ym.value?.unselect();
const reselect = (offset: number): void => ym.value?.reselect(offset);
const open = (target: HTMLElement & { dataItems: SelectItem[]; dataValue: unknown }): void =>
	ym.value?.open(target);
const close = (): void => ym.value?.close();
const resize = (): void => ym.value?.resize();
const createItems = (items: SelectItem[]): void => ym.value?.createItems(items);
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
	attachElementApi(el, {
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
		clear
	});
});
</script>
