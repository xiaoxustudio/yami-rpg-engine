<template>
	<param-list ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement
} from '@/util/element-utils';

interface ParamListElement extends HTMLElement {
	bind(object: any): this;
	read(): any[] | null;
	write(data: any[]): void;
	update(): void;
	resize(): void;
	updateFlexibleHeight(): void;
	updateHeadAndFoot(): void;
	updateOnResize(): void;
	select(start: number, end?: number): void;
	selectMultiple(active: number): void;
	selectAll(): void;
	unselect(): void;
	reselect(): void;
	selectUp(): void;
	selectDown(): void;
	selectMultipleUp(): void;
	selectMultipleDown(): void;
	scrollToSelection(): void;
	insert(): void;
	edit(): void;
	toggle(): void;
	enableItems(items: any[]): void;
	disableItems(items: any[]): void;
	copy(): void;
	paste(): void;
	delete(): void;
	undo(): void;
	redo(): void;
	save(): void;
	clearElements(start: number): void;
	clear(): this;
	listFocus(event: Event): void;
	listBlur(event: Event): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	pointerup(event: PointerEvent): void;
	doubleclick(event: Event): void;
	windowPointerup: (event: PointerEvent) => void;
	windowPointermove: (event: PointerEvent) => void;
	readonly innerHeight: number;
	readonly paddingTop: number;
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
	change: [value: any[] | null];
}>();

const root = ref<ParamListElement | null>(null);

const bind = (object: any): ParamListElement | undefined => root.value?.bind(object);
const read = (): any[] | null => (root.value ? readElement(root.value) : undefined) ?? null;
const write = (data: any[]): void => { if (root.value) writeElement(root.value, data); };
const update = (): void => root.value?.update();
const resize = (): void => root.value?.resize();
const updateFlexibleHeight = (): void => root.value?.updateFlexibleHeight();
const updateHeadAndFoot = (): void => root.value?.updateHeadAndFoot();
const updateOnResize = (): void => root.value?.updateOnResize();
const select = (start: number, end?: number): void => root.value?.select(start, end);
const selectMultiple = (active: number): void => root.value?.selectMultiple(active);
const selectAll = (): void => root.value?.selectAll();
const unselect = (): void => root.value?.unselect();
const reselect = (): void => root.value?.reselect();
const selectUp = (): void => root.value?.selectUp();
const selectDown = (): void => root.value?.selectDown();
const selectMultipleUp = (): void => root.value?.selectMultipleUp();
const selectMultipleDown = (): void => root.value?.selectMultipleDown();
const scrollToSelection = (): void => root.value?.scrollToSelection();
const insert = (): void => root.value?.insert();
const edit = (): void => root.value?.edit();
const toggle = (): void => root.value?.toggle();
const enableItems = (items: any[]): void => root.value?.enableItems(items);
const disableItems = (items: any[]): void => root.value?.disableItems(items);
const copy = (): void => root.value?.copy();
const paste = (): void => root.value?.paste();
const delete_ = (): void => root.value?.delete();
const undo = (): void => root.value?.undo();
const redo = (): void => root.value?.redo();
const save = (): void => root.value?.save();
const clearElements = (start: number): void => root.value?.clearElements(start);
const clear = (): ParamListElement | undefined => (root.value ? clearElement(root.value) : undefined);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({
	bind, read, write, update, resize, updateFlexibleHeight, updateHeadAndFoot,
	updateOnResize, select, selectMultiple, selectAll, unselect, reselect,
	selectUp, selectDown, selectMultipleUp, selectMultipleDown, scrollToSelection,
	insert, edit, toggle, enableItems, disableItems, copy, paste, delete: delete_,
	undo, redo, save, clearElements, clear, on, root
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.addEventListener('change', () => emit('change', readElement(el)));
});
</script>
