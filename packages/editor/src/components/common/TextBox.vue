<template>
	<YMTextBox
		ref="ym"
		:model-value="props.modelValue"
		:disabled="props.disabled"
		:id="props.id"
		@input="onInput"
		@change="onChange"
		@focus="onFocus"
		@blur="onBlur"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMTextBox } from '@ui-kit';
import { TextHistory, type HistoryInputElement } from '@ui-kit';
import { attachElementApi } from '@app/utils/attach-element-api';

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
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: string;
	disabled?: boolean;
	/** 占位文案也可由模板 `t()` 承担 */
	placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false,
	placeholder: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	change: [value: string];
	input: [value: string];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

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
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): string => ym.value?.read() ?? '';
const write = (value: string): void => {
	ym.value?.write(value);
	emit('update:modelValue', ym.value?.read() ?? '');
};
const insert = (value: string): void => ym.value?.insert(value);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const focus = (): void => ym.value?.focus();
const getFocus = (mode: string | null): HTMLInputElement =>
	ym.value?.getFocus(mode) as HTMLInputElement;
const setPlaceholder = (placeholder: string): void => ym.value?.setPlaceholder(placeholder);
const setMaxLength = (length: number): void => ym.value?.setMaxLength(length);
const fitContent = (): void => ym.value?.fitContent();
const deleteInputContent = (): void => ym.value?.deleteInputContent();
const addCloseButton = (): void => ym.value?.addCloseButton();
const addKeydownFilter = (): void => ym.value?.addKeydownFilter();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

// `placeholder` 属性随语言切换重挂（`t()` 响应式 ⇒ 切换语言后这里自动重跑）
watch(
	() => props.placeholder,
	(value) => {
		ym.value?.setPlaceholder(value ?? '');
	},
	{ immediate: true }
);

const onInput = (value: string): void => {
	emit('update:modelValue', value);
	emit('input', value);
};

const onChange = (value: string): void => emit('change', value);

const onFocus = (event: FocusEvent): void => emit('focus', event);

const onBlur = (event: FocusEvent): void => emit('blur', event);

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

onMounted(() => {
	const el = root.value as TextBoxElement | null;
	const input = ym.value?.input ?? null;
	if (!el || !input) return;
	// 与 `NumberBox.vue` 同形：用 ui-kit 导出的 `HistoryInputElement` 做单次断言。
	(input as HistoryInputElement).history = new TextHistory(input);
	attachElementApi(el, {
		input,
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
		on
	});
});
</script>
