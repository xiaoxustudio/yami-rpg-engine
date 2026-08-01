<template>
	<command-list ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement
} from '@/util/element-utils';

interface CommandListElement extends HTMLElement {
	read(): any;
	write(data: any): void;
	update(): void;
	resize(...args: any[]): void;
	select(start: any, end?: any): void;
	unselect(): void;
	reselect(): void;
	selectAll(): void;
	selectUp(): void;
	selectDown(): void;
	pageUp(select: any): void;
	pageDown(select: any): void;
	scrollToSelection(mode?: string): void;
	clear(): void;
	insert(id?: string): void;
	edit(data?: any): void;
	fold(element?: any): void;
	toggle(): void;
	copy(): void;
	paste(): void;
	delete(): void;
	undo(): void;
	redo(): void;
	save(command: any): void;
}

const root = ref<CommandListElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (data: any): void => { if (root.value) writeElement(root.value, data); };
const update = (): void => root.value?.update();
const resize = (...args: any[]): void => root.value?.resize(...args);
const select = (start: any, end?: any): void => root.value?.select(start, end);
const unselect = (): void => root.value?.unselect();
const reselect = (): void => root.value?.reselect();
const selectAll = (): void => root.value?.selectAll();
const selectUp = (): void => root.value?.selectUp();
const selectDown = (): void => root.value?.selectDown();
const pageUp = (select: any): void => root.value?.pageUp(select);
const pageDown = (select: any): void => root.value?.pageDown(select);
const scrollToSelection = (mode?: string): void => root.value?.scrollToSelection(mode);
const clear = (): void => { if (root.value) clearElement(root.value); };
const insert = (id?: string): void => root.value?.insert(id);
const edit = (data?: any): void => root.value?.edit(data);
const fold = (element?: any): void => root.value?.fold(element);
const toggle = (): void => root.value?.toggle();
const copy = (): void => root.value?.copy();
const paste = (): void => root.value?.paste();
const deleteItems = (): void => root.value?.delete();
const undo = (): void => root.value?.undo();
const redo = (): void => root.value?.redo();
const save = (command: any): void => root.value?.save(command);

defineExpose({
	read,
	write,
	update,
	resize,
	select,
	unselect,
	reselect,
	selectAll,
	selectUp,
	selectDown,
	pageUp,
	pageDown,
	scrollToSelection,
	clear,
	insert,
	edit,
	fold,
	toggle,
	copy,
	paste,
	delete: deleteItems,
	undo,
	redo,
	save,
	root
});
</script>
