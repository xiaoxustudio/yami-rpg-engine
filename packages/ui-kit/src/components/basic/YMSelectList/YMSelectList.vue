<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { createSelectListApi, type SelectItem, type SelectListApi } from './select-list-api';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const root = ref<HTMLElement | null>(null);

let api: SelectListApi | null = null;

const read = (): unknown => api?.read();
const write = (value: unknown): void => api?.write(value);
const select = (element: HTMLElement): void => api?.select(element);
const unselect = (): void => api?.unselect();
const reselect = (offset: number): void => api?.reselect(offset);
const open = (target: unknown): void => api?.open(target);
const close = (): void => api?.close();
const resize = (): void => api?.resize();
const updateHeadAndFoot = (): void => api?.updateHeadAndFoot();
const createItems = (items: unknown[]): void => api?.createItems(items as SelectItem[]);
const pageUp = (selectFlag: boolean): void => api?.pageUp(selectFlag);
const pageDown = (selectFlag: boolean): void => api?.pageDown(selectFlag);
const getElementIndexOfSelection = (defIndex: number): number =>
	api?.getElementIndexOfSelection(defIndex) ?? defIndex;
const scrollToSelection = (): void => api?.scrollToSelection();
const clearElements = (start: number): void => api?.clearElements(start);
const clear = (): HTMLElement | undefined => api?.clear() as HTMLElement | undefined;

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
	api = createSelectListApi(el);
});
</script>

<template>
	<div ref="root" class="select-list" :id="props.id" />
</template>

<style module>
:global(:where(.select-list)) {
	display: block;
	position: fixed;
	overflow-y: auto;
	user-select: none;
}

:global(:where(.select-item)) {
	display: block;
	height: 20px;
	line-height: 20px;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(:where(.select-item.selected)) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}
</style>
