<template>
	<node-list ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  read as readElement,
  clear as clearElement
} from '@/util/element-utils';

interface TreeListElement extends HTMLElement {
	bind(getter: any): void;
	read(): any;
	initialize(): void;
	update(): void;
	refresh(): void;
	resize(): void;
	open(item: any): void;
	select(item: any): void;
	selectWithNoEvent(item: any): void;
	unselect(item?: any): void;
	selectRelative(direction: any): void;
	expandSelection(): void;
	scrollToSelection(mode?: string): void;
	scrollToHome(): void;
	scrollToEnd(): void;
	pageUp(select: any): void;
	pageDown(select: any): void;
	rename(item: any): void;
	cancelRenaming(): void;
	clear(): void;
	searchNodes(keyword: any): void;
	searchNodesDebounced(keyword: any): void;
	duplicate(item: any): void;
	deleteNode(item: any): void;
	addNodeTo(sItem: any, dItem: any, insertBefore?: boolean): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const root = ref<TreeListElement | null>(null);

const bind = (getter: any): void => root.value?.bind(getter);
const read = (): any => (root.value ? readElement(root.value) : undefined);
const initialize = (): void => root.value?.initialize();
const update = (): void => root.value?.update();
const refresh = (): void => root.value?.refresh();
const resize = (): void => root.value?.resize();
const open = (item: any): void => root.value?.open(item);
const select = (item: any): void => root.value?.select(item);
const selectWithNoEvent = (item: any): void => root.value?.selectWithNoEvent(item);
const unselect = (item?: any): void => root.value?.unselect(item);
const selectRelative = (direction: any): void => root.value?.selectRelative(direction);
const expandSelection = (): void => root.value?.expandSelection();
const scrollToSelection = (mode?: string): void => root.value?.scrollToSelection(mode);
const scrollToHome = (): void => root.value?.scrollToHome();
const scrollToEnd = (): void => root.value?.scrollToEnd();
const pageUp = (select: any): void => root.value?.pageUp(select);
const pageDown = (select: any): void => root.value?.pageDown(select);
const rename = (item: any): void => root.value?.rename(item);
const cancelRenaming = (): void => root.value?.cancelRenaming();
const clear = (): void => { if (root.value) clearElement(root.value); };
const searchNodes = (keyword: any): void => root.value?.searchNodes(keyword);
const searchNodesDebounced = (keyword: any): void => root.value?.searchNodesDebounced(keyword);
const duplicate = (item: any): void => root.value?.duplicate(item);
const deleteNode = (item: any): void => root.value?.deleteNode(item);
const addNodeTo = (sItem: any, dItem: any, insertBefore?: boolean): void =>
	root.value?.addNodeTo(sItem, dItem, insertBefore);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({
	bind,
	read,
	initialize,
	update,
	refresh,
	resize,
	open,
	select,
	selectWithNoEvent,
	unselect,
	selectRelative,
	expandSelection,
	scrollToSelection,
	scrollToHome,
	scrollToEnd,
	pageUp,
	pageDown,
	rename,
	cancelRenaming,
	clear,
	searchNodes,
	searchNodesDebounced,
	duplicate,
	deleteNode,
	addNodeTo,
	on,
	root
});
</script>
