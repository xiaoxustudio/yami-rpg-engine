<template>
	<YMColorBox
		ref="ym"
		:model-value="props.modelValue"
		:disabled="isDisabled"
		:popup="false"
		:id="props.id"
		@open="openColor"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMColorBox } from '@ui-kit';
import { Color } from '@app/legacy/tools/color-picker-window';
import { attachElementApi } from '@app/utils/attach-element-api';

interface ColorBoxElement extends HTMLElement {
	dataValue: string;
	foreground: HTMLElement;
	inputEventEnabled: boolean;
	read(): string;
	write(color: string): void;
	input(color: string): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
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

const isDisabled = ref(props.disabled);

const ym = ref<{
	root: HTMLElement | null;
	read(): string;
	write(color: string): void;
	input(color: string): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): string => ym.value?.read() ?? '';
const write = (color: string): void => ym.value?.write(color);
const input = (color: string): void => {
	const el = root.value;
	if (!el) return;
	const last = read();
	if (last !== color) {
		write(color);
		el.dispatchEvent(new Event('change', { bubbles: true }));
		emit('input', color);
		emit('update:modelValue', color);
	}
};
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

const openColor = (): void => {
	const el = root.value;
	if (!el || isDisabled.value) return;
	Color.open(el);
};

defineExpose({ read, write, input, enable, disable, on, root });

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as ColorBoxElement | null;
	if (!el) return;
	el.tabIndex = 0;
	Object.defineProperty(el, 'dataValue', {
		configurable: true,
		get: () => ym.value?.read?.() ?? '',
		set: (value: string) => ym.value?.write?.(value)
	});
	el.foreground = el.querySelector('.color-box-foreground') as HTMLElement;
	el.inputEventEnabled = false;
	attachElementApi(el, { read, write, input, enable, disable, on });
	el.addEventListener('keydown', (event: KeyboardEvent) => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!(event.ctrlKey || event.metaKey)) {
					event.stopPropagation();
					Color.open(el);
				}
				break;
		}
	});
	on('input', (e: Event & { value?: unknown }) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
