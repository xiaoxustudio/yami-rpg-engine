<template>
	<text-box ref="root" :id="props.id" />
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

interface TextBoxElement extends HTMLElement {
	input: HTMLInputElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	lastText: string;
	hiddenNodes: any[];
	closeButton: HTMLElement | null;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	focus(): void;
	getFocus(mode: string | null): HTMLInputElement;
	setPlaceholder(placeholder: string): void;
	setMaxLength(length: number): void;
	fitContent(): void;
	deleteInputContent(): void;
	addCloseButton(): void;
	addKeydownFilter(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: string;
	placeholder?: string;
	maxLength?: number;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	placeholder: '',
	maxLength: -1,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	change: [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<TextBoxElement | null>(null);

const read = (): string => (root.value ? readElement(root.value) : undefined) ?? '';
const write = (value: string): void => { if (root.value) writeElement(root.value, value); };
const insert = (value: string): void => root.value?.insert(value);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const focus = (): void => root.value?.focus();
const getFocus = (mode: string | null): HTMLInputElement | undefined =>
	root.value ? getFocusElement(root.value, mode) : undefined;
const setPlaceholder = (placeholder: string): void =>
	root.value?.setPlaceholder(placeholder);
const setMaxLength = (length: number): void => root.value?.setMaxLength(length);
const fitContent = (): void => root.value?.fitContent();
const deleteInputContent = (): void => root.value?.deleteInputContent();
const addCloseButton = (): void => root.value?.addCloseButton();
const addKeydownFilter = (): void => root.value?.addKeydownFilter();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({
	read,
	write,
	insert,
	focus,
	getFocus,
	setPlaceholder,
	setMaxLength,
	fitContent,
	deleteInputContent,
	addCloseButton,
	addKeydownFilter,
	on,
	root
});

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));
watch(() => props.placeholder, (val) => setPlaceholder(val));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	if (props.placeholder) el.setPlaceholder(props.placeholder);
	if (props.maxLength >= 0) el.setMaxLength(props.maxLength);
	el.on('input', () => {
		emit('update:modelValue', readElement(el));
		emit('input', readElement(el));
	});
	el.on('change', () => emit('change', readElement(el)));
	el.on('focus', (e: FocusEvent) => emit('focus', e));
	el.on('blur', (e: FocusEvent) => emit('blur', e));
	writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
