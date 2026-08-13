<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { createTreeListApi } from './tree-api';

interface Props {
	id?: string;
	padded?: boolean;
	renderNodeExtras?: (item: unknown, container: HTMLElement) => void;
}

interface TreeListRootElement extends HTMLElement {
	resize: EventListener;
	keydown: EventListener;
	pointerdown: EventListener;
	pointerup: EventListener;
	dragstart: EventListener;
	dragend: EventListener;
	dataChange: EventListener;
}

const props = withDefaults(defineProps<Props>(), {
	padded: false
});

const root = ref<HTMLElement | null>(null);

onMounted(() => {
	const el = root.value;
	if (!el) return;
	if (props.padded) el.setAttribute('padded', '');
	createTreeListApi(el, {
		renderNodeExtras: props.renderNodeExtras
	});
});

onBeforeUnmount(() => {
	const el = root.value as TreeListRootElement | null;
	if (!el) return;
	el.removeEventListener('scroll', el.resize);
	el.removeEventListener('keydown', el.keydown);
	el.removeEventListener('pointerdown', el.pointerdown);
	el.removeEventListener('pointerup', el.pointerup);
	el.removeEventListener('dragstart', el.dragstart);
	el.removeEventListener('dragend', el.dragend);
	el.removeEventListener('change', el.dataChange);
});
</script>

<template>
	<div ref="root" class="tree-list" :id="props.id" />
</template>

<style module>
:global(.tree-list) {
	display: block;
	width: 100%;
	height: 100%;
	overflow-y: auto;
	user-select: none;
}

:global(node-item) {
	display: block;
	height: 20px;
	line-height: 20px;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
}

:global(node-item.selected) {
	color: var(--ym-color-on-primary);
	background-color: var(--ym-color-selected);
}

:global(folder-mark) {
	display: inline-block;
	vertical-align: top;
	width: 16px;
	height: 20px;
}

:global(node-icon) {
	display: inline-block;
	vertical-align: top;
	margin: 2px 2px 2px 0;
	width: 16px;
	height: 16px;
	line-height: 16px;
	font-size: 14px;
	text-indent: 0;
	text-align: center;
	pointer-events: none;
}

:global(:where(.tree-node-extras)) {
	display: contents;
}

:global(:where(.drag-and-drop-hint)) {
	position: absolute;
	pointer-events: none;
	z-index: 0;
}
</style>
