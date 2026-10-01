<template>
	<YMColorBox
		ref="ym"
		:model-value="props.modelValue"
		:disabled="props.disabled"
		:popup="false"
		:id="props.id"
		:label="props.label"
		@open="openColor"
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
	/** 可访问名（透传给 ui-kit 的 aria-label），不渲染可见文本 */
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
	// 读 props 而不是本地 ref：本地那份是挂载时的快照，运行期改 disabled 后守卫会失效
	if (!el || props.disabled) return;
	Color.open(el);
};

defineExpose({ read, write, input, enable, disable, on, root });

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
	on('input', (e: YamiEvent) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
