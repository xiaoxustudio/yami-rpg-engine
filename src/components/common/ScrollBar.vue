<template>
	<scroll-bar ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ScrollBarElement extends HTMLElement {
	target: HTMLElement | null;
	type: string | null;
	thumb: HTMLElement | null;
	bind(target: HTMLElement, type: string): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	updateDisplay(state: boolean): void;
}

const root = ref<ScrollBarElement | null>(null);

const bind = (target: HTMLElement, type: string): void => root.value?.bind(target, type);
const updateHorizontalBar = (): void => root.value?.updateHorizontalBar();
const updateVerticalBar = (): void => root.value?.updateVerticalBar();
const updateDisplay = (state: boolean): void => root.value?.updateDisplay(state);

defineExpose({ bind, updateHorizontalBar, updateVerticalBar, updateDisplay, root });
</script>
