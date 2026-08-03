<template>
	<div class="command-list" ref="root" :id="props.id"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { CommandList, attachCommandListApi } from '@/components/command-list';
import { applyCommandListInstanceOverride } from '@/module/eslints';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

const method = (name: string) => {
	return (...args: any[]): any => (root.value as any)?.[name](...args);
};

defineExpose({
	root,
	read: method('read'),
	write: method('write'),
	update: method('update'),
	resize: method('resize'),
	updateHeadAndFoot: method('updateHeadAndFoot'),
	updateOnResize: method('updateOnResize'),
	createFoldedCommandBuffer: method('createFoldedCommandBuffer'),
	createItems: method('createItems'),
	createCommandBuffer: method('createCommandBuffer'),
	updateCommandElement: method('updateCommandElement'),
	updateCommandElementFold: method('updateCommandElementFold'),
	deleteCommandBuffers: method('deleteCommandBuffers'),
	createBlankElement: method('createBlankElement'),
	computeTextIndent: method('computeTextIndent'),
	select: method('select'),
	selectMultiple: method('selectMultiple'),
	selectAll: method('selectAll'),
	unselect: method('unselect'),
	reselect: method('reselect'),
	selectUp: method('selectUp'),
	selectDown: method('selectDown'),
	pageUp: method('pageUp'),
	pageDown: method('pageDown'),
	selectMultipleTo: method('selectMultipleTo'),
	selectMultipleUp: method('selectMultipleUp'),
	selectMultipleDown: method('selectMultipleDown'),
	scrollToSelection: method('scrollToSelection'),
	scrollAndResize: method('scrollAndResize'),
	getRangeByIndex: method('getRangeByIndex'),
	getRangeByData: method('getRangeByData'),
	isParentEnabled: method('isParentEnabled'),
	insert: method('insert'),
	edit: method('edit'),
	fold: method('fold'),
	unfoldCommand: method('unfoldCommand'),
	reselectAfterFolding: method('reselectAfterFolding'),
	toggle: method('toggle'),
	enableItems: method('enableItems'),
	disableItems: method('disableItems'),
	copy: method('copy'),
	copyAsText: method('copyAsText'),
	copyAsJSCode: method('copyAsJSCode'),
	generateExecutableCode: method('generateExecutableCode'),
	paste: method('paste'),
	delete: method('delete'),
	undo: method('undo'),
	redo: method('redo'),
	save: method('save'),
	getSelectionPosition: method('getSelectionPosition'),
	clearElements: method('clearElements'),
	clear: method('clear'),
	analyzeVariables: method('analyzeVariables'),
	scheduleCheckVariables: method('scheduleCheckVariables'),
	checkVariables: method('checkVariables'),
	tryGetEventId: method('tryGetEventId'),
	findString: method('findString'),
	scrollToRow: method('scrollToRow'),
	listFocus: method('listFocus'),
	listBlur: method('listBlur'),
	keydown: method('keydown'),
	pointerdown: method('pointerdown'),
	pointerup: method('pointerup'),
	doubleclick: method('doubleclick'),
	history: () => (root.value as any)?.history,
	paddingTop: () => (root.value as any)?.paddingTop
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	Object.setPrototypeOf(el, CommandList.prototype);
	attachCommandListApi(el);
	el.tabIndex = 0;
	(el as any)._initialized = true;
	applyCommandListInstanceOverride(el);
});
</script>
