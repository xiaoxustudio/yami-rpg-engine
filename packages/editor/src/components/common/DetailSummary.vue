<template>
	<YMDetailSummary ref="ym" :id="props.id">
		<slot />
	</YMDetailSummary>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMDetailSummary } from '@ui-kit';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const ym = ref<{
	root: HTMLElement | null;
	toggle(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const toggle = (): void => ym.value?.toggle();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ toggle, on, root });
</script>
