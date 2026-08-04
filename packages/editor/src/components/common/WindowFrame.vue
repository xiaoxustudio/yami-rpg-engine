<template>
	<YMWindowFrame
		ref="ym"
		:id="props.id"
		:focusable-selector="focusableSelector"
		:localize="localizeAdapter"
	>
		<slot />
	</YMWindowFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMWindowFrame } from '@ui-kit';
import { Layout } from '@/layout/layout';
import { Local } from '@/tools/localization';

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const focusableSelector = computed<string>(() => Layout.focusableSelector as string);
const localizeAdapter = computed(() => Local);

const ym = ref<{
	root: HTMLElement | null;
	open(): void;
	close(): boolean;
	maximize(): void;
	unmaximize(): void;
	focus(): void;
	blur(): void;
	setTitle(text: string): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const open = (): void => ym.value?.open();
const close = (): boolean => ym.value?.close() ?? false;
const maximize = (): void => ym.value?.maximize();
const unmaximize = (): void => ym.value?.unmaximize();
const focus = (): void => ym.value?.focus();
const blur = (): void => ym.value?.blur();
const setTitle = (text: string): void => ym.value?.setTitle(text);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ open, close, maximize, unmaximize, focus, blur, setTitle, on, root });

onMounted(() => {
	const el = root.value as any;
	if (!el) return;
	el.open = open;
	el.close = close;
	el.maximize = maximize;
	el.unmaximize = unmaximize;
	el.focus = focus;
	el.blur = blur;
	el.setTitle = setTitle;
	el.on = on;
});
</script>
