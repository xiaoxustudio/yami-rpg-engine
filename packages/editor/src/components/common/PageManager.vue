<template>
	<YMPageManager ref="ym" :id="props.id">
		<slot />
	</YMPageManager>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMPageManager } from '@ui-kit';

interface PageManagerElement extends HTMLElement {
	switch(value: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), {});

const emit = defineEmits<{
	switch: [last: unknown, value: unknown];
}>();

const ym = ref<{
	root: HTMLElement | null;
	switch(value: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const switchover = (value: unknown): void => ym.value?.switch(value);

const on = (
	type: string,
	listener: (event: Event) => void,
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
	el.addEventListener('switch', (e: Event & { last?: unknown; value?: unknown }) =>
		emit('switch', e.last, e.value)
	);
});
</script>
