<template>
	<select-box ref="root" :id="props.id" />
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  clear as clearElement,
  enable as enableElement,
  disable as disableElement
} from '@/util/element-utils';

interface SelectBoxElement extends HTMLElement {
	read(): any;
	write(value: any): void;
	write2(value: any): void;
	input(value: any): void;
	loadItems(items: any): void;
	setItemNames(options: any): void;
	relate(entries: any): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	clear(): any;
	enableHiddenMode(): any;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: any;
	dataItems: any[];
}

interface Props {
	id?: string;
	modelValue?: any;
	items?: any[];
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => [],
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	write: [value: any];
	input: [value: any];
	change: [value: any];
}>();

const root = ref<SelectBoxElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const write2 = (value: any): void => root.value?.write2(value);
const input = (value: any): void => root.value?.input(value);
const loadItems = (items: any): void => root.value?.loadItems(items);
const setItemNames = (options: any): void => root.value?.setItemNames(options);
const relate = (entries: any): void => root.value?.relate(entries);
const save = (): void => root.value?.save();
const restore = (): void => root.value?.restore();
const clear = (): any => (root.value ? clearElement(root.value) : undefined);
const enableHiddenMode = (): any => root.value?.enableHiddenMode();
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({
	read,
	write,
	write2,
	input,
	loadItems,
	setItemNames,
	relate,
	save,
	restore,
	clear,
	enableHiddenMode,
	on,
	root
});

watch(() => props.modelValue, (val) => write(val));
watch(() => props.items, (val) => loadItems(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.loadItems(props.items);
	el.on('input', (e: any) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	el.on('write', (e: any) => emit('write', e.value));
	el.on('change', () => emit('change', readElement(el)));
	if (props.modelValue !== null) writeElement(el, props.modelValue);
	if (props.disabled) disableElement(el);
});
</script>
