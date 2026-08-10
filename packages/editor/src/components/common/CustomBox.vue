<template>
	<YMCustomBox
		ref="ym"
		:id="props.id"
		:type="props.type"
		:filter="props.filter"
		:disabled="props.disabled"
		:model-value="props.modelValue"
		:getters="getters"
		:parsers="parsers"
		:file-dialog="fileDialog"
		:browser="browser"
		:localize="localize"
		@write="onWrite"
		@input="onInput"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { YMCustomBox } from '@ui-kit';
import { customBoxOptions } from '../../legacy/components/custom-box-opts';

interface Props {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: any;
}

const props = withDefaults(defineProps<Props>(), {
	type: '',
	filter: '',
	disabled: false,
	modelValue: null
});

const emit = defineEmits<{
	write: [value: any];
	input: [value: any];
}>();

const onWrite = (value: any) => {
	emit('write', value);
};
const onInput = (value: any) => {
	emit('input', value);
};

const getters = customBoxOptions.getters ?? null;
const parsers = customBoxOptions.parsers ?? null;
const fileDialog = customBoxOptions.fileDialog ?? null;
const browser = customBoxOptions.browser ?? null;
const localize = customBoxOptions.localize ?? null;

const ym = ref<{
	root: HTMLElement | null;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	enable(): void;
	disable(): void;
	focus(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);

const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): any => ym.value?.read();
const write = (value: any): void => ym.value?.write(value);
const input = (value: any): void => ym.value?.input(value);
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const focus = (): void => ym.value?.focus();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

defineExpose({ read, write, input, enable, disable, focus, on, root });

onMounted(() => {
const el = root.value as HTMLElement & Record<'read' | 'write' | 'input' | 'enable' | 'disable' | 'on', any>;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.input = input;
	el.enable = enable;
	el.disable = disable;
	el.on = on;
});
</script>

