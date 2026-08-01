<template>
	<radio-proxy ref="root" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  read as readElement,
  write as writeElement,
  enable as enableElement,
  disable as disableElement
} from '@/util/element-utils';

interface RadioRelationEntry {
	case: any;
	targets: RadioProxyElement[];
}

interface RadioProxyElement extends HTMLElement {
	dataValue: any;
	relations: RadioRelationEntry[];
	cancelable: boolean;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	reset(): void;
	enable(): void;
	disable(): void;
	relate(entries: RadioRelationEntry[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

const emit = defineEmits<{
	write: [value: any];
	input: [value: any, lastValue: any];
}>();

const root = ref<RadioProxyElement | null>(null);

const read = (): any => (root.value ? readElement(root.value) : undefined);
const write = (value: any): void => { if (root.value) writeElement(root.value, value); };
const input = (value: any): void => root.value?.input(value);
const reset = (): void => root.value?.reset();
const enable = (): void => { if (root.value) enableElement(root.value); };
const disable = (): void => { if (root.value) disableElement(root.value); };
const relate = (entries: RadioRelationEntry[]): void => root.value?.relate(entries);
const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.on(type, listener, options);
};

defineExpose({ read, write, input, reset, enable, disable, relate, on, root });

onMounted(() => {
	const el = root.value;
	if (!el) return;
	el.on('write', (e: any) => emit('write', e.value));
	el.on('input', (e: any) => emit('input', e.value, e.lastValue));
});
</script>
