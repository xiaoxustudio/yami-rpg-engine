<template>
	<title-bar ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface TitleBarElement extends HTMLElement {
	dragging: PointerEvent | null;
	pointerdown(event: PointerEvent): void;
	mouseclick(event: Event): void;
	doubleclick(event: Event): void;
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
	pointerdown: [event: PointerEvent];
	click: [event: Event];
	doubleclick: [event: Event];
}>();

const root = ref<TitleBarElement | null>(null);

const pointerdown = (event: PointerEvent): void => root.value?.pointerdown(event);
const mouseclick = (event: Event): void => root.value?.mouseclick(event);
const doubleclick = (event: Event): void => root.value?.doubleclick(event);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ pointerdown, mouseclick, doubleclick, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('pointerdown', (e: any) => emit('pointerdown', e));
	el.on('click', (e: any) => emit('click', e));
	el.on('doubleclick', (e: any) => emit('doubleclick', e));
});
</script>
