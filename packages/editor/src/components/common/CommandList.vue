<template>
	<YMCommandList ref="ym" :id="props.id" :options="commandListOptions" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMCommandList } from '@ui-kit';
import { commandListOptions } from '@app/components/command-list';
import { applyCommandListInstanceOverride, ensureUpdateCommandElementOverride } from '@app/module/eslints';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const method = (name: string) => {
	const el = root.value as (HTMLElement & Record<string, (...args: unknown[]) => unknown>) | null;
	return (...args: unknown[]): unknown => el?.[name](...args);
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
	listFocus: method('listFocus'),
	listBlur: method('listBlur'),
	findString: method('findString'),
	scrollToRow: method('scrollToRow'),
	keydown: method('keydown'),
	pointerdown: method('pointerdown'),
	pointerup: method('pointerup'),
	doubleclick: method('doubleclick'),
	windowPointerup: method('windowPointerup'),
	windowPointermove: method('windowPointermove'),
	windowVariableChange: method('windowVariableChange'),
	on: method('on')
});

onMounted(() => {
	const el = root.value;
	if (!el) return;
	ensureUpdateCommandElementOverride();
	applyCommandListInstanceOverride(el);
});
</script>
