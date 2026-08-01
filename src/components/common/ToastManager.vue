<template>
	<toast-manager ref="root" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface ToastManagerElement extends HTMLElement {
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

const root = ref<ToastManagerElement | null>(null);

const show = (
	message: string,
	type?: string,
	duration?: number
): HTMLDivElement | undefined => root.value?.show(message, type, duration);
const dismiss = (el: HTMLElement | null): void => root.value?.dismiss(el);

defineExpose({ show, dismiss, root });
</script>
