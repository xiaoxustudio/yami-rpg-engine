<template>
	<YMFilterBox ref="ym" :id="props.id" :width="props.width" :height="props.height" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMFilterBox } from '@ui-kit';
import { attachElementApi } from '@app/utils/attach-element-api';

interface FilterBoxElement extends HTMLElement {
	read(): [number, number, number, number] | null;
	write(tint: [number, number, number, number]): void;
	update(): void;
	clear(): void;
}

interface Props {
	id?: string;
	width?: number | string;
	height?: number | string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	read(): [number, number, number, number] | null;
	write(tint: [number, number, number, number]): void;
	update(): void;
	clear(): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): [number, number, number, number] | null => ym.value?.read() ?? null;
const write = (tint: [number, number, number, number]): void => ym.value?.write(tint);
const update = (): void => ym.value?.update();
const clear = (): void => ym.value?.clear();

defineExpose({ read, write, update, clear, root });

onMounted(() => {
	const el = root.value as FilterBoxElement | null;
	if (!el) return;
	attachElementApi(el, { read, write, update, clear });
});
</script>
