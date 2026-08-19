<template>
	<YMNavBar ref="ym" :id="props.id">
		<slot />
	</YMNavBar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMNavBar } from '@ui-kit';
import { attachElementApi } from '@app/utils/attach-element-api';

interface NavBarElement extends HTMLElement {
	read(): unknown;
	write(value: unknown): void;
	unselect(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

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

onMounted(() => {
	const el = root.value as NavBarElement | null;
	if (!el) return;
	attachElementApi(el, { read, write, unselect, on });
});
</script>
