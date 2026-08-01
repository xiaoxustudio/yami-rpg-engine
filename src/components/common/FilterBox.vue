<template>
	<filter-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement
} from '@/util/element-utils';

interface FilterBoxElement extends HTMLElement {
	canvas: HTMLCanvasElement | null;
	dataValue: [number, number, number, number] | null;
	read(): [number, number, number, number] | null;
	write(tint: [number, number, number, number]): void;
	update(): void;
	clear(): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<FilterBoxElement | null>(null);

const read = (): [number, number, number, number] | null => (root.value ? readElement(root.value) : undefined) ?? null;
const write = (tint: [number, number, number, number]): void => { if (root.value) writeElement(root.value, tint); };
const update = (): void => root.value?.update();
const clear = (): void => { if (root.value) clearElement(root.value); };

defineExpose({ read, write, update, clear, root });
</script>
