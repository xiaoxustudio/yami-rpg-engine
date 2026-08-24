<template>
	<YMMarqueeArea ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMMarqueeArea } from '@ui-kit';
import { attachElementApi } from '@app/utils/attach-element-api';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

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
	const el = root.value as HTMLElement & Record<'save' | 'restore' | 'resize' | 'clear' | 'select', any>;
	if (!el) return;
	attachElementApi(el, { save, restore, resize, clear, select });
});
</script>
