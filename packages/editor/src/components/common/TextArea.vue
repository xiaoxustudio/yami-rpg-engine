<template>
	<YMTextArea
		ref="ym"
		:model-value="props.modelValue"
		:disabled="isDisabled"
		:id="props.id"
		@input="onInput"
		@focus="onFocus"
		@blur="onBlur"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMTextArea } from '@ui-kit';
import { TextHistory } from '@/components/text-history';
import { listenDraggingScrollbarEvent } from '@/util/element-utils';
import { attachElementApi } from '@/utils/attach-element-api';

interface TextAreaElement extends HTMLElement {
	input: HTMLTextAreaElement;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode?: string): void;
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

const isDisabled = ref(props.disabled);

const ym = ref<{
	root: HTMLElement | null;
	input: HTMLTextAreaElement | null;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode?: string): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): string => ym.value?.read() ?? '';
const write = (value: string): void => ym.value?.write(value);
const insert = (value: string): void => ym.value?.insert(value);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const getFocus = (mode?: string): void => ym.value?.getFocus(mode);
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

const onInput = (value: string): void => {
	emit('update:modelValue', value);
	emit('input', value);
};

const onFocus = (event: FocusEvent): void => emit('focus', event);

const onBlur = (event: FocusEvent): void => emit('blur', event);

defineExpose({ read, write, insert, enable, disable, getFocus, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as TextAreaElement | null;
	const input = ym.value?.input ?? null;
	if (!el || !input) return;
	input.history = new TextHistory(input);
	listenDraggingScrollbarEvent(input);
	attachElementApi(el, { input, read, write, insert, enable, disable, getFocus, on });
});
</script>
