<template>
	<drag-and-drop-hint ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface DragAndDropHintElement extends HTMLElement {
	left: number;
	top: number;
	width: number;
	height: number;
	upper: boolean;
	measure(item: HTMLElement): { left: number; top: number; width: number; height: number };
	moveUp(): DragAndDropHintElement;
	moveDown(): DragAndDropHintElement;
	set(coords: { left: number; top: number; width: number; height: number }): void;
}

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const root = ref<DragAndDropHintElement | null>(null);

const measure = (item: HTMLElement) => root.value?.measure(item);
const moveUp = () => root.value?.moveUp();
const moveDown = () => root.value?.moveDown();
const set = (coords: { left: number; top: number; width: number; height: number }) =>
	root.value?.set(coords);

defineExpose({ measure, moveUp, moveDown, set, root });
</script>
