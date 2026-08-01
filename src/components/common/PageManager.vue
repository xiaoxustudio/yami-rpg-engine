<template>
	<page-manager ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface PageManagerElement extends HTMLElement {
	index: any;
	active: HTMLElement | null;
	switchEventEnabled: boolean;
	switch(value: any): void;
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
	switch: [last: any, value: any];
}>();

const root = ref<PageManagerElement | null>(null);

const switchover = (value: any): void => root.value?.switch(value);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ switch: switchover, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('switch', (e: any) => emit('switch', e.last, e.value));
});
</script>
