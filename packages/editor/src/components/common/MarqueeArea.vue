<template>
	<YMMarqueeArea ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMMarqueeArea } from '@ui-kit';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	save(key?: string): void;
	restore(key?: string): void;
	resize(size?: { width: number; height: number }): void;
	clear(): void;
	select(x?: number, y?: number, width?: number, height?: number): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const save = (key: string = 'default'): void => ym.value?.save(key);
const restore = (key: string = 'default'): void => ym.value?.restore(key);
const resize = (size?: { width: number; height: number }): void => ym.value?.resize(size);
const clear = (): void => ym.value?.clear();
const select = (x?: number, y?: number, width?: number, height?: number): void =>
	ym.value?.select(x, y, width, height);

defineExpose({ save, restore, resize, clear, select, root });

onMounted(() => {
	const el = root.value as any;
	if (!el) return;
	el.save = save;
	el.restore = restore;
	el.resize = resize;
	el.clear = clear;
	el.select = select;
});
</script>
