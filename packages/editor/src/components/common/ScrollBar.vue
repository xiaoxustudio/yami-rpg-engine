<template>
	<YMScrollBar ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMScrollBar } from '@ui-kit';

interface ScrollBarElement extends HTMLElement {
	bind(target: HTMLElement, type: string): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	updateDisplay(value: boolean): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const ym = ref<{
	root: HTMLElement | null;
	bind(target: HTMLElement, type: string): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	updateDisplay(value: boolean): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const bind = (target: HTMLElement, type: string): void => ym.value?.bind(target, type);
const updateHorizontalBar = (): void => ym.value?.updateHorizontalBar();
const updateVerticalBar = (): void => ym.value?.updateVerticalBar();
const updateDisplay = (value: boolean): void => ym.value?.updateDisplay(value);

defineExpose({ bind, updateHorizontalBar, updateVerticalBar, updateDisplay, root });

onMounted(() => {
	const el = root.value as ScrollBarElement | null;
	if (!el) return;
	el.bind = bind;
	el.updateHorizontalBar = updateHorizontalBar;
	el.updateVerticalBar = updateVerticalBar;
	el.updateDisplay = updateDisplay;
});
</script>
