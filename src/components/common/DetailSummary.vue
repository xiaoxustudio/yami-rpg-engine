<template>
	<detail-summary ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface DetailSummaryElement extends HTMLElement {
	toggle(): void;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
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

const root = ref<DetailSummaryElement | null>(null);

const toggle = (): void => root.value?.toggle();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ toggle, on, root });
</script>
