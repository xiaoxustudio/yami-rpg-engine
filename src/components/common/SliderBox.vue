<template>
	<slider-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement
} from '@/util/element-utils';

interface SliderBoxElement extends HTMLElement {
	read(): number;
	write(value: any): void;
	enable(): void;
	disable(): void;
	updateFiller(): void;
	synchronize(target: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	filler: HTMLElement;
	input: HTMLInputElement;
	synchronizer: HTMLElement & { value: any; [k: string]: any };
	bar: HTMLElement & { [k: string]: any };
	step: number;
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	sliderInput(event: any): void;
	inputWheel(event: any): void;
}

interface Props {
	id?: string;
	modelValue?: number;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	activeWheel?: boolean;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	min: '0',
	max: '0',
	step: '1',
	activeWheel: false,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	input: [value: number];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<SliderBoxElement | null>(null);

const read = (): number => (root.value ? readElement(root.value) : undefined) ?? 0;
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const synchronize = (target: any): void => root.value?.synchronize(target);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, enable, disable, synchronize, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.setAttribute('min', String(props.min));
	el.setAttribute('max', String(props.max));
	el.setAttribute('step', String(props.step));
	if (props.activeWheel) el.setAttribute('active-wheel', '');
	el.on('input', () => {
		const value = readElement(el);
		emit('input', value);
		emit('update:modelValue', value);
	});
	el.on('focus', (e: FocusEvent) => emit('focus', e));
	el.on('blur', (e: FocusEvent) => emit('blur', e));
	writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
