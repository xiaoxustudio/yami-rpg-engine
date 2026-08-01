<template>
	<check-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
	read as readElement,
	write as writeElement,
	enable as enableElement,
	disable as disableElement,
	addClass
} from '@/util/element-utils';

interface CheckBoxElement extends HTMLElement {
	read(): boolean;
	write(value: boolean): void;
	input(value: boolean): void;
	enable(): void;
	disable(): void;
	relate(elements: HTMLElement[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: boolean;
	_isStandard: boolean;
	_standardMark: HTMLElement;
	pointerdown: (event: PointerEvent) => void;
	mouseclick: (event: Event) => void;
}

interface Props {
	id?: string;
	standard?: boolean;
	large?: boolean;
	disabled?: boolean;
	modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	standard: false,
	large: false,
	disabled: false,
	modelValue: false
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	write: [value: boolean];
	input: [value: boolean];
	change: [value: boolean];
}>();

const root = ref<CheckBoxElement | null>(null);

const ensureStandard = (el: CheckBoxElement): void => {
	if (!props.standard || el._isStandard) return;
	el._isStandard = true;
	el._standardMark = document.createElement('check-mark');
	el.tabIndex = 0;
	el.insertBefore(el._standardMark, el.childNodes[0] || null);
	el.removeEventListener('pointerdown', el.pointerdown);
	el.addEventListener('click', el.mouseclick);
};

const read = (): boolean => (root.value ? readElement(root.value) : undefined) ?? false;
const write = (value: boolean): void => { if (root.value) writeElement(root.value, value); };
const input = (value: boolean): void => root.value?.input(value);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const relate = (elements: HTMLElement[]): void => root.value?.relate(elements);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, input, enable, disable, relate, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	if (props.standard) addClass(el, 'standard');
	if (props.large) addClass(el, 'large');
	ensureStandard(el);
	el.on('input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	el.on('write', (e: any) => emit('write', e.value));
	el.on('change', () => emit('change', readElement(el)));
	if (props.modelValue) writeElement(el, true);
	if (props.disabled) disableElement(el);
});
</script>
