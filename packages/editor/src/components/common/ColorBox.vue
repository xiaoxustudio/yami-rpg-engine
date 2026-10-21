<template>
	<YMColorBox
		ref="ym"
		:model-value="props.modelValue"
		:disabled="props.disabled"
		:popup="false"
		:id="props.id"
		:label="props.label"
		@open="openColor"
		@keydown="onKeydown"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { YamiEvent } from '@app/types/editor-event';
import { YMColorBox } from '@ui-kit';
import { Color } from '@app/tools/color-picker-window';
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
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: '',
	disabled: false,
	label: ''
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	input: [value: string];
}>();

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
	if (!el || props.disabled) return;
	Color.open(el);
};

/**
 * 根元素上的 `keydown`。原先是在 `onMounted` 里用内联闭包 `addEventListener` 挂的，
 * 现改模板 `@keydown`（`YMColorBox` 单根，事件经 fallthrough 落到它自己的根 div 上）。
 * 处理器从 `root.value` 取元素，与原先捕获的 `el` 是同一个节点。
 */
const onKeydown = (event: KeyboardEvent): void => {
	const el = root.value;
	if (!el) return;
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			if (!(event.ctrlKey || event.metaKey)) {
				event.stopPropagation();
				Color.open(el);
			}
			break;
	}
};

defineExpose({ read, write, input, enable, disable, on, root });

onMounted(() => {
	const el = root.value as ColorBoxElement | null;
	if (!el) return;
	el.tabIndex = 0;
	Object.defineProperty(el, 'dataValue', {
		configurable: true,
		get: () => ym.value?.read?.() ?? '',
		set: (value: string) => {
			// 写成块体：setter 不能有返回值（`eslint(no-setter-return)`），
			// 而 `ym.value?.write?.(value)` 作表达式体就会被判为"返回值"。行为完全一致。
			ym.value?.write?.(value);
		}
	});
	el.foreground = el.querySelector('.color-box-foreground') as HTMLElement;
	el.inputEventEnabled = false;
	attachElementApi(el, { read, write, input, enable, disable, on });
	on('input', (e: YamiEvent) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
