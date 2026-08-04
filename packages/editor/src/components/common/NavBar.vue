<template>
	<YMNavBar ref="ym" :id="props.id">
		<slot />
	</YMNavBar>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMNavBar } from '@ui-kit';

interface NavBarElement extends HTMLElement {
	read(): any;
	write(value: any): void;
	unselect(): void;
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

const ym = ref<{
	root: HTMLElement | null;
	read(): any;
	write(value: any): void;
	unselect(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): any => ym.value?.read();
const write = (value: any): void => ym.value?.write(value);
const unselect = (): void => ym.value?.unselect();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, unselect, on, root });

onMounted(() => {
	const el = root.value as NavBarElement | null;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.unselect = unselect;
	el.on = on;
});
</script>
