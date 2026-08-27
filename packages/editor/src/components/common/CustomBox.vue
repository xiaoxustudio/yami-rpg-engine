?
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { YMCustomBox } from '@ui-kit';
import { customBoxOptions } from '../custom-box-opts';
import { attachElementApi } from '@app/utils/attach-element-api';

interface Props {
	id?: string;
	type?: string;
	filter?: string;
	disabled?: boolean;
	modelValue?: unknown;
}

const props = withDefaults(defineProps<Props>(), {
	type: '',
	filter: '',
	disabled: false,
	modelValue: null
});

const emit = defineEmits<{
	write: [value: unknown];
	input: [value: unknown];
	'update:modelValue': [value: unknown];
}>();

const onWrite = (value: unknown) => {
	emit('write', value);
	emit('update:modelValue', value);
};
const onInput = (value: unknown) => {
	emit('input', value);
	emit('update:modelValue', value);
};

const getters = customBoxOptions.getters ?? null;
const parsers = customBoxOptions.parsers ?? null;
const fileDialog = customBoxOptions.fileDialog ?? null;
const browser = customBoxOptions.browser ?? null;
const localize = customBoxOptions.localize ?? null;

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	input(value: unknown): void;
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

const read = (): unknown => ym.value?.read();
const write = (value: unknown): void => ym.value?.write(value);
const input = (value: unknown): void => ym.value?.input(value);
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
	const el = root.value as HTMLElement & {
		read(): unknown;
		write(value: unknown): void;
		input(value: unknown): void;
		enable(): void;
		disable(): void;
		on(
			type: string,
			listener: (event: Event) => void,
			options?: boolean | AddEventListenerOptions
		): void;
	};
	if (!el) return;
	attachElementApi(el, { read, write, input, enable, disable, on });
	ym.value?.write(props.modelValue ?? '');
	const onLocalize = (): void => {
		ym.value?.update?.();
	};
	window.addEventListener('localize', onLocalize);
	onBeforeUnmount(() => {
		window.removeEventListener('localize', onLocalize);
	});
});
</script>
