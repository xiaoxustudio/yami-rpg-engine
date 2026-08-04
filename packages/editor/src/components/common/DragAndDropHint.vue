<template>
	<YMDragAndDropHint ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMDragAndDropHint } from '@ui-kit';

interface DragAndDropHintCoords {
	left: number;
	top: number;
	width: number;
	height: number;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	measure(item: HTMLElement): DragAndDropHintCoords;
	moveUp(): unknown;
	moveDown(): unknown;
	set(coords: DragAndDropHintCoords): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const measure = (item: HTMLElement): DragAndDropHintCoords => ym.value!.measure(item);
const moveUp = (): unknown => ym.value?.moveUp();
const moveDown = (): unknown => ym.value?.moveDown();
const set = (coords: DragAndDropHintCoords): void => ym.value?.set(coords);

defineExpose({ measure, moveUp, moveDown, set, root });

onMounted(() => {
	const el = root.value as any;
	if (!el) return;
	el.measure = measure;
	el.moveUp = moveUp;
	el.moveDown = moveDown;
	el.set = set;
});
</script>
