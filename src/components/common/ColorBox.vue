<template>
	<color-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
	read as readElement,
	write as writeElement,
	enable as enableElement,
	disable as disableElement
} from '@/util/element-utils';

interface ColorBoxElement extends HTMLElement {
	read(): string;
	write(color: string): void;
	input(color: string): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: string;
	foreground: HTMLElement;
	inputEventEnabled: boolean;
	_initialized: boolean;
	_background: HTMLElement;
	keydown: (event: KeyboardEvent) => void;
	mouseclick: (event: Event) => void;
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
}>();

const root = ref<ColorBoxElement | null>(null);

const read = (): string => (root.value ? readElement(root.value) : undefined) ?? '';
const write = (color: string): void => { if (root.value) writeElement(root.value, color); };
const input = (color: string): void => root.value?.input(color);
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, input, enable, disable, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
