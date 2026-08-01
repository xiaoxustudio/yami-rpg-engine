<template>
	<keyboard-box ref="root" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement,
  getFocus as getFocusElement
} from '@/util/element-utils';

interface KeyboardBoxElement extends HTMLElement {
	read(): number;
	write(code: number): void;
	inputCode(code: number): void;
	enable(): void;
	disable(): void;
	getFocus(mode: string): HTMLInputElement;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const emit = defineEmits<{
	input: [value: number];
	focus: [];
	blur: [];
}>();

const root = ref<KeyboardBoxElement | null>(null);

const read = (): number => (root.value ? readElement(root.value) : undefined) ?? 0;
const write = (code: number): void => { if (root.value) writeElement(root.value, code); };
const inputCode = (code: number): void => root.value?.inputCode(code);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const getFocus = (mode: string): HTMLInputElement | undefined =>
	root.value ? getFocusElement(root.value, mode) : undefined;
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, inputCode, enable, disable, getFocus, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('input', (e: any) => emit('input', e.value));
	el.on('focus', () => emit('focus'));
	el.on('blur', () => emit('blur'));
});
</script>
