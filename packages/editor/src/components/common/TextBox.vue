<template>
	<YMTextBox ref="ym" :model-value="props.modelValue" :disabled="isDisabled" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMTextBox } from '@ui-kit';
import { TextHistory } from '@/components/text-history';

interface TextBoxElement extends HTMLElement {
	input: HTMLInputElement;
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
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	change: [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const isDisabled = ref(props.disabled);

const ym = ref<{
	root: HTMLElement | null;
	input: HTMLInputElement | null;
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
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): string => ym.value?.read() ?? '';
const write = (value: string): void => ym.value?.write(value);
const insert = (value: string): void => ym.value?.insert(value);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const focus = (): void => ym.value?.focus();
const getFocus = (mode: string | null): HTMLInputElement => ym.value?.getFocus(mode) as HTMLInputElement;
const setPlaceholder = (placeholder: string): void => ym.value?.setPlaceholder(placeholder);
const setMaxLength = (length: number): void => ym.value?.setMaxLength(length);
const fitContent = (): void => ym.value?.fitContent();
const deleteInputContent = (): void => ym.value?.deleteInputContent();
const addCloseButton = (): void => ym.value?.addCloseButton();
const addKeydownFilter = (): void => ym.value?.addKeydownFilter();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({
	read,
	write,
	insert,
	enable,
	disable,
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

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as TextBoxElement | null;
	const input = ym.value?.input ?? null;
	if (!el || !input) return;
	input.history = new TextHistory(input);
	el.input = input;
	el.read = read;
	el.write = write;
	el.insert = insert;
	el.enable = enable;
	el.disable = disable;
	el.focus = focus;
	el.getFocus = getFocus;
	el.setPlaceholder = setPlaceholder;
	el.setMaxLength = setMaxLength;
	el.fitContent = fitContent;
	el.deleteInputContent = deleteInputContent;
	el.addCloseButton = addCloseButton;
	el.addKeydownFilter = addKeydownFilter;
	el.on = on;
	input.addEventListener('input', () => {
		const val = read();
		emit('update:modelValue', val);
		emit('input', val);
	});
	input.addEventListener('change', () => emit('change', read()));
	input.addEventListener('focus', (e: FocusEvent) => emit('focus', e));
	input.addEventListener('blur', (e: FocusEvent) => emit('blur', e));
});
</script>
