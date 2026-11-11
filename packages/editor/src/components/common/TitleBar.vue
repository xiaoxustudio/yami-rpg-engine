<template>
	<YMTitleBar ref="ym" :id="props.id">
		<slot />
	</YMTitleBar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMTitleBar } from '@ui-kit';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const ym = ref<{
	root: HTMLElement | null;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ on, root });
</script>
