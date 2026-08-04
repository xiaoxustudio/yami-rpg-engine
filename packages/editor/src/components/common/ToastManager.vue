<template>
	<YMToastManager ref="ym" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMToastManager } from '@ui-kit';

interface ToastManagerElement extends HTMLElement {
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
}

const ym = ref<{
	show(message: string, type?: string, duration?: number): HTMLDivElement;
	dismiss(el: HTMLElement | null): void;
	root: HTMLElement | null;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const show = (
	message: string,
	type: string = 'info',
	duration: number = 4000
): HTMLDivElement => ym.value?.show(message, type, duration) as HTMLDivElement;

const dismiss = (el: HTMLElement | null): void => ym.value?.dismiss(el);

defineExpose({ show, dismiss, root });

onMounted(() => {
	const el = root.value as ToastManagerElement | null;
	if (!el) return;
	el.show = show;
	el.dismiss = dismiss;
});
</script>
