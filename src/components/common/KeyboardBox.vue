<template>
	<div class="keyboard-box" ref="root">
		<input class="keyboard-box-input" ref="input" type="text" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus as getFocusElement,
	dispatchChangeEvent
} from '@/util/element-utils';

const emit = defineEmits<{
	input: [value: number];
	focus: [];
	blur: [];
}>();

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

let dataValue = 0;
let inputEventEnabled = false;
let focusEventEnabled = false;
let blurEventEnabled = false;

const read = (): number => dataValue;

const write = (code: number): void => {
	dataValue = code;
	if (input.value) {
		input.value.value = String(code);
	}
};

const inputCode = (code: number): void => {
	if (dataValue !== code) {
		write(code);
		if (inputEventEnabled) {
			const inputEvent = new InputEvent('input') as InputEvent & {
				value: number;
			};
			inputEvent.value = dataValue;
			root.value?.dispatchEvent(inputEvent);
		}
		dispatchChangeEvent(root.value);
	}
};

const enable = (): void => {
	if (removeClass(root.value, 'disabled')) {
		showChildNodes(root.value);
	}
};

const disable = (): void => {
	if (addClass(root.value, 'disabled')) {
		hideChildNodes(root.value);
	}
};

const getFocus = (mode: string): HTMLInputElement => getFocusElement(input.value, mode) as any;

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
	switch (type) {
		case 'input':
			inputEventEnabled = true;
			break;
		case 'focus':
			if (!focusEventEnabled) {
				focusEventEnabled = true;
				input.value?.addEventListener('focus', () => {
					root.value?.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!blurEventEnabled) {
				blurEventEnabled = true;
				input.value?.addEventListener('blur', () => {
					root.value?.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

const inputKeydown = (event: KeyboardEvent): void => {
	event.stopPropagation();
	event.preventDefault();
	switch (event.code) {
		case 'Backspace':
			inputCode(0);
			break;
		case 'Enter':
		case 'NumpadEnter':
			event.stopImmediatePropagation();
		default:
			inputCode(parseInt(event.code) || 0);
			break;
	}
};

onMounted(() => {
	input.value?.addEventListener('keydown', inputKeydown);
	const el = root.value as any;
	if (!el) {
		return;
	}
	el.read = read;
	el.write = write;
	el.inputCode = inputCode;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	el.input = input.value;
	on('input', (event: any) => emit('input', event.value));
	on('focus', () => emit('focus'));
	on('blur', () => emit('blur'));
});

defineExpose({ read, write, inputCode, enable, disable, getFocus, on, root });
</script>
