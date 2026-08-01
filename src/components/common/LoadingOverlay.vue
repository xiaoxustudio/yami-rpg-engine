<template>
	<loading-overlay ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface LoadingOverlayElement extends HTMLElement {
	setText(text: string): void;
	show(text?: string): void;
	hide(): void;
}

const root = ref<LoadingOverlayElement | null>(null);

const setText = (text: string): void => root.value?.setText(text);
const show = (text?: string): void => root.value?.show(text);
const hide = (): void => root.value?.hide();

defineExpose({ setText, show, hide, root });
</script>
