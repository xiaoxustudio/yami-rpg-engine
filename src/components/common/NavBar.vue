<template>
	<nav-bar ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement
} from '@/util/element-utils';

interface NavBarElement extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	read(): any;
	write(value: any): void;
	unselect(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	pointerdown: (event: PointerEvent) => void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	write: [value: any];
	select: [value: any];
}>();

const root = ref<NavBarElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const unselect = (): void => root.value?.unselect();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, unselect, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('write', (e: any) => emit('write', e.value));
	el.on('select', (e: any) => emit('select', e.value));
});
</script>
