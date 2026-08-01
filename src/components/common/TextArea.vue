<template>
	<text-area ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement,
  getFocus as getFocusElement
} from '@/util/element-utils';

interface TextAreaElement extends HTMLElement {
	input: HTMLElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
	inputKeydown(event: any): void;
	inputInput(event: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<TextAreaElement | null>(null);

const read = (): string => (root.value ? readElement(root.value) : undefined) ?? '';
const write = (value: string): void => { if (root.value) writeElement(root.value, value); };
const insert = (value: string): void => root.value?.insert(value);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const getFocus = (mode: any): void => { if (root.value) getFocusElement(root.value, mode); };
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, insert, enable, disable, getFocus, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('input', () => {
		const val = readElement(el);
		emit('input', val);
		emit('update:modelValue', val);
	});
	el.on('focus', (e: FocusEvent) => emit('focus', e));
	el.on('blur', (e: FocusEvent) => emit('blur', e));
	writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
