<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	attachDragAndDropHintApi,
	type DragAndDropHintApi,
	type DragAndDropHintCoords
} from './drag-and-drop-hint-api';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLElement | null>(null);

let api: DragAndDropHintApi | null = null;

const measure = (item: HTMLElement): DragAndDropHintCoords => api!.measure(item);
const moveUp = (): DragAndDropHintApi | undefined => api?.moveUp();
const moveDown = (): DragAndDropHintApi | undefined => api?.moveDown();
const set = (coords: DragAndDropHintCoords): void => api?.set(coords);

defineExpose({ measure, moveUp, moveDown, set, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	api = attachDragAndDropHintApi(el);
});
</script>

<template>
	<div ref="root" class="drag-and-drop-hint" :id="props.id" />
</template>

<style module>
:global(:where(.drag-and-drop-hint)) {
	display: block;
	position: absolute;
	pointer-events: none;
}

:global(:where(.drag-and-drop-hint.for-tab)),
:global(:where(.drag-and-drop-hint.for-list)) {
	background-color: var(--node-hint-background);
}

:global(:where(.drag-and-drop-hint.for-group)) {
	background-color: rgba(0, 128, 255, 0.25);
}
</style>
