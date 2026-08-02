<template>
	<div ref="root" class="color-box" :id="props.id" />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	dispatchChangeEvent
} from '@/util/element-utils';
import { Color } from '@/tools/color-picker-window';

interface ColorBoxElement extends HTMLElement {
	dataValue: string;
	foreground: HTMLElement;
	inputEventEnabled: boolean;
	_initialized: boolean;
	_background: HTMLElement;
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
	keydown(event: KeyboardEvent): void;
	mouseclick(event: Event): void;
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

const state = reactive({
	dataValue: '',
	inputEventEnabled: false
});

let foreground: HTMLElement | null = null;

const read = (): string => state.dataValue;

const write = (color: string): void => {
	state.dataValue = color;
	if (!foreground) return;
	const r = parseInt(color.slice(0, 2), 16);
	const g = parseInt(color.slice(2, 4), 16);
	const b = parseInt(color.slice(4, 6), 16);
	const a = parseInt(color.slice(6, 8), 16) / 255;
	foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
};

const input = (color: string): void => {
	if (state.dataValue !== color) {
		write(color);
		const el = root.value;
		if (el) {
			if (state.inputEventEnabled) {
				const inputEvent = new Event('input') as Event & {
					value: string;
				};
				inputEvent.value = state.dataValue;
				el.dispatchEvent(inputEvent);
			}
			dispatchChangeEvent(el);
		}
		emit('input', state.dataValue);
		emit('update:modelValue', state.dataValue);
	}
};

const enable = (): void => {
	const el = root.value;
	if (el && removeClass(el, 'disabled')) {
		showChildNodes(el);
	}
};

const disable = (): void => {
	const el = root.value;
	if (el && addClass(el, 'disabled')) {
		hideChildNodes(el);
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	switch (type) {
		case 'input':
			state.inputEventEnabled = true;
			break;
	}
};

defineExpose({ read, write, input, enable, disable, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	if (!el) return;

	const background = document.createElement('box');
	addClass(background, 'color-box-background');
	const foregroundEl = document.createElement('box');
	addClass(foregroundEl, 'color-box-foreground');

	foreground = foregroundEl;

	el.appendChild(background);
	el.appendChild(foregroundEl);
	el.tabIndex = 0;

	el.dataValue = state.dataValue;
	el.foreground = foregroundEl;
	el._background = background;
	el.inputEventEnabled = false;
	el._initialized = true;
	el.read = read;
	el.write = write;
	el.input = input;
	el.enable = enable;
	el.disable = disable;
	el.on = on;

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					mouseclick(event);
				}
				break;
		}
	};

	const mouseclick = (event: Event): void => {
		Color.open(el);
	};

	el.keydown = keydown;
	el.mouseclick = mouseclick;
	el.addEventListener('keydown', keydown as EventListener);
	el.addEventListener('click', mouseclick as EventListener);

	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
