<template>
	<switch-item ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement
} from '@/util/element-utils';

interface SwitchItemElement extends HTMLElement {
	read(): number;
	write(value: number): void;
	update(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: number;
	class: string;
	length: number;
	inputEventEnabled: boolean;
}

interface Props {
	id?: string;
	length?: number;
	modelValue?: number;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	length: 1,
	modelValue: 0,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	input: [value: number];
}>();

const root = ref<SwitchItemElement | null>(null);

const read = (): number => (root.value ? readElement(root.value) : undefined) ?? 0;
const write = (value: number): void => { if (root.value) writeElement(root.value, value); };
const update = (): void => root.value?.update();
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, update, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (root.value ? (val ? disableElement(root.value) : enableElement(root.value)) : undefined));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.setAttribute('length', String(props.length));
	el.length = Math.clamp(props.length, 1, 4);
	el.on('input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	if (props.modelValue) writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
