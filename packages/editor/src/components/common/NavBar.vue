<template>
	<YMNavBar ref="ym" :id="props.id">
		<slot />
	</YMNavBar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMNavBar } from '@ui-kit';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	unselect(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): unknown => ym.value?.read();
const write = (value: unknown): void => ym.value?.write(value);
const unselect = (): void => ym.value?.unselect();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, unselect, on, root });
</script>
