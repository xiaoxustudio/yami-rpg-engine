<template>
	<detail-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';

interface DetailBoxElement extends HTMLElement {
	toggleEventEnabled: boolean;
	toggle(): void;
	open(): void;
	close(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	open?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	open: false
});

const emit = defineEmits<{
	toggle: [value: string];
}>();

const root = ref<DetailBoxElement | null>(null);

const toggle = (): void => root.value?.toggle();
const open = (): void => root.value?.open();
const close = (): void => root.value?.close();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ toggle, open, close, on, root });

watch(() => props.open, (val) => (val ? open() : close()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('toggle', (e: any) => emit('toggle', e.value));
	if (props.open) el.open();
});
</script>
