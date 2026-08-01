<template>
	<window-frame ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface WindowFrameElement extends HTMLElement {
	enableAmbient: boolean;
	activeElement: HTMLElement | null;
	focusableElements: HTMLElement[] | null;
	windowResize: ((event: Event) => void) | null;
	openEventEnabled: boolean;
	closeEventEnabled: boolean;
	closedEventEnabled: boolean;
	resizeEventEnabled: boolean;
	maximizeEventEnabled: boolean;
	unmaximizeEventEnabled: boolean;
	open(): void;
	close(): boolean;
	maximize(): void;
	unmaximize(): void;
	focus(): void;
	blur(): void;
	computePosition(): void;
	center(): void;
	absolute(left: number, top: number): void;
	overlap(parent: WindowFrameElement): void;
	setPosition(x: number, y: number, rect: DOMRect): void;
	setTitle(text: string): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	open: [];
	close: [];
	closed: [];
	resize: [];
	maximize: [];
	unmaximize: [];
}>();

const root = ref<WindowFrameElement | null>(null);

const open = (): void => root.value?.open();
const close = (): void => root.value?.close();
const maximize = (): void => root.value?.maximize();
const unmaximize = (): void => root.value?.unmaximize();
const focus = (): void => root.value?.focus();
const blur = (): void => root.value?.blur();
const setTitle = (text: string): void => root.value?.setTitle(text);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ open, close, maximize, unmaximize, focus, blur, setTitle, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('open', () => emit('open'));
	el.on('close', () => emit('close'));
	el.on('closed', () => emit('closed'));
	el.on('resize', () => emit('resize'));
	el.on('maximize', () => emit('maximize'));
	el.on('unmaximize', () => emit('unmaximize'));
});
</script>
