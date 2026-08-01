<template>
	<number-box ref="root" :id="props.id" />
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

interface NumberBoxElement extends HTMLElement {
	input: HTMLInputElement;
	decimals: number;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_unit: string | null;
	_attrSource: HTMLElement | null;
	read(): number;
	write(value: any): void;
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
	modelValue?: number;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	decimals?: number;
	unit?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	min: '0',
	max: '0',
	step: '1',
	decimals: 0,
	unit: null,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	change: [value: number];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<NumberBoxElement | null>(null);

const read = (): number => (root.value ? readElement(root.value) : undefined) ?? 0;
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
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

defineExpose({ read, write, enable, disable, getFocus, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.setAttribute('min', String(props.min));
	el.setAttribute('max', String(props.max));
	el.setAttribute('step', String(props.step));
	el.setAttribute('decimals', String(props.decimals));
	if (props.unit !== null) el.setAttribute('unit', props.unit);
	el.input.on('change', () => {
		emit('update:modelValue', readElement(el));
		emit('change', readElement(el));
	});
	el.on('focus', (e: any) => emit('focus', e));
	el.on('blur', (e: any) => emit('blur', e));
	writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
