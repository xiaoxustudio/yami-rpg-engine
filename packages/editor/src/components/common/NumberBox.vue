<template>
	<YMNumberBox
		ref="ym"
		:model-value="props.modelValue"
		:min="props.min"
		:max="props.max"
		:step="props.step"
		:decimals="props.decimals"
		:unit="props.unit"
		:disabled="isDisabled"
		:id="props.id"
		@change="onChange"
		@focus="onFocus"
		@blur="onBlur"
	>
		<slot />
	</YMNumberBox>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMNumberBox } from '@ui-kit';
import { NumberHistory } from '@app/legacy/components/number-history';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';

interface NumberBoxElement extends HTMLElement {
	input: HTMLInputElement;
	read(): number;
	write(value: unknown): void;
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
	modelValue?: number | string;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	decimals?: number | string;
	unit?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	min: '0',
	max: '0',
	step: '1',
	decimals: 0,
	unit: '',
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	change: [value: number];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const isDisabled = ref(props.disabled);

const ym = ref<{
	root: HTMLElement | null;
	input: HTMLInputElement | null;
	read(): number;
	write(value: unknown): void;
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

const read = (): number => ym.value?.read() ?? 0;
const write = (value: unknown): void => ym.value?.write(value);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const getFocus = (mode?: string): void => ym.value?.getFocus(mode);
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

const onChange = (value: number): void => {
	emit('update:modelValue', value);
	emit('change', value);
};

const onFocus = (event: FocusEvent): void => emit('focus', event);

const onBlur = (event: FocusEvent): void => emit('blur', event);

defineExpose({ read, write, enable, disable, getFocus, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as NumberBoxElement | null;
	const input = ym.value?.input ?? null;
	if (!el || !input) return;
	input.history = new NumberHistory(input);
	attachElementApi(el, { input, read, write, enable, disable, getFocus, on });
});
</script>
