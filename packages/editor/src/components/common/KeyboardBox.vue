<template>
	<YMKeyboardBox ref="ym" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMKeyboardBox } from '@ui-kit';
import { attachElementApi } from '@app/utils/attach-element-api';

interface KeyboardBoxElement extends HTMLElement {
	input: HTMLInputElement;
	read(): number;
	write(code: number): void;
	inputCode(code: number): void;
	enable(): void;
	disable(): void;
	getFocus(mode: string): HTMLInputElement | null;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const emit = defineEmits<{
	input: [value: number];
	focus: [];
	blur: [];
}>();

const ym = ref<{
	root: HTMLElement | null;
	input: HTMLInputElement | null;
	read(): number;
	write(code: number): void;
	inputCode(code: number): void;
	enable(): void;
	disable(): void;
	getFocus(mode: string): HTMLInputElement | null;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): number => ym.value?.read() ?? 0;
const write = (code: number): void => ym.value?.write(code);
const inputCode = (code: number): void => ym.value?.inputCode(code);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const getFocus = (mode: string): HTMLInputElement | null => ym.value?.getFocus(mode) ?? null;
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, inputCode, enable, disable, getFocus, on, root });

onMounted(() => {
	const el = root.value as KeyboardBoxElement | null;
	if (!el) return;
	attachElementApi(el, {
		input: ym.value?.input as HTMLInputElement,
		read,
		write,
		inputCode,
		enable,
		disable,
		getFocus,
		on
	});
	on('input', (event: Event) => emit('input', event.value));
	on('focus', () => emit('focus'));
	on('blur', () => emit('blur'));
});
</script>
