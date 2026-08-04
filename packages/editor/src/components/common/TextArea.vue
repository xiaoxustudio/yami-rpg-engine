<template>
	<YMTextArea ref="ym" :model-value="props.modelValue" :disabled="isDisabled" :id="props.id" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMTextArea } from '@ui-kit';
import { TextHistory } from '@/components/text-history';
import { listenDraggingScrollbarEvent } from '@/util/element-utils';

interface TextAreaElement extends HTMLElement {
	input: HTMLTextAreaElement;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
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

const isDisabled = ref(props.disabled);

const ym = ref<{
	root: HTMLElement | null;
	input: HTMLTextAreaElement | null;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
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
const getFocus = (mode: any): void => ym.value?.getFocus(mode);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, insert, enable, disable, getFocus, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as TextAreaElement | null;
	const input = ym.value?.input ?? null;
	if (!el || !input) return;
	input.history = new TextHistory(input);
	listenDraggingScrollbarEvent(input);
	el.input = input;
	el.read = read;
	el.write = write;
	el.insert = insert;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	input.addEventListener('input', () => {
		const val = read();
		emit('update:modelValue', val);
		emit('input', val);
	});
	input.addEventListener('focus', (e: FocusEvent) => emit('focus', e));
	input.addEventListener('blur', (e: FocusEvent) => emit('blur', e));
});
</script>
