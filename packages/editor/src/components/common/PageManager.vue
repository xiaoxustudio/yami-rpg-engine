<template>
	<YMPageManager ref="ym" :id="props.id">
		<slot />
	</YMPageManager>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMPageManager } from '@ui-kit';

interface PageManagerElement extends HTMLElement {
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

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
	switch: [last: any, value: any];
}>();

const ym = ref<{
	root: HTMLElement | null;
	switch(value: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const switchover = (value: any): void => ym.value?.switch(value);

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ switch: switchover, on, root });

onMounted(() => {
	const el = root.value as PageManagerElement | null;
	if (!el) return;
	el.switch = switchover;
	el.on = on;
	// YMPageManager dispatches a native `switch` event on the root; relay it
	// to the Vue `switch` emit so parent components can listen via @switch.
	el.addEventListener('switch', (e: any) => emit('switch', e.last, e.value));
});
</script>
