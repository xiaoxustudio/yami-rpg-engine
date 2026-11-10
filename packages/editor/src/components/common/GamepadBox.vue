<template>
	<YMGamepadBox ref="ym" :id="props.id" :label="props.label" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { YMGamepadBox } from '@ui-kit';

interface Props {
	id?: string;
	label?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '', label: '' });

const ym = ref<{
	root: HTMLElement | null;
	read(): number | null;
	write(button: number): void;
	enable(): void;
	disable(): void;
	getFocus(mode: string): HTMLInputElement | null;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): number | null => ym.value?.read() ?? null;
const write = (button: number): void => ym.value?.write(button);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const getFocus = (mode: string): HTMLInputElement | null => ym.value?.getFocus(mode) ?? null;

defineExpose({ read, write, enable, disable, getFocus, root });
</script>
