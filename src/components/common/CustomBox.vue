<template>
	<custom-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement
} from '@/util/element-utils';

interface CustomBoxElement extends HTMLElement {
	info: HTMLElement;
	dataValue: any;
	writeEventEnabled: boolean;
	inputEventEnabled: boolean;
	_initialized: boolean;
	type: string | null;
	filter: string | null;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	update(): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: any;
	type?: string;
	filter?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	type: '',
	filter: '',
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	input: [value: any];
	write: [value: any];
}>();

const root = ref<CustomBoxElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const input = (value: any): void => root.value?.input(value);
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
	if (props.type) el.setAttribute('type', props.type);
	if (props.filter) el.setAttribute('filter', props.filter);
	el.on('input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	el.on('write', (e: any) => emit('write', e.value));
	writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
