<template>
	<div class="gamepad-box" ref="root">
		<input class="gamepad-box-input" ref="input" type="text" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus as getFocusElement,
	dispatchChangeEvent
} from '@/util/element-utils';
import { getButtonName } from './gamepad-button-name';

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

let dataValue: number | null = null;
let intervalIndex: number | null = null;

const read = (): number | null => dataValue;

const write = (button: number): void => {
	dataValue = button;
	if (input.value) {
		input.value.value = getButtonName(button);
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

const getFocus = (mode: any): any => getFocusElement(input.value, mode);

const inputKeydown = (event: any): void => {
	switch (event.code) {
		case 'Tab':
			break;
		case 'Backspace':
			event.preventDefault();
			write(-1);
			dispatchChangeEvent(root.value);
			break;
		default:
			event.preventDefault();
			break;
	}
};

const inputFocus = (event: any): void => {
	let lastPad = null;

	const inputKeyCode = () => {
		const pads = navigator.getGamepads();
		const pad = pads[0] || pads[1] || pads[2] || pads[3] || null;
		if (pad !== null) {
			if (lastPad === null) {
				lastPad = Object.clone(pad);
				for (const button of lastPad.buttons) {
					button.pressed = false;
					button.value = 0;
				}
			}
			if (lastPad.id === pad.id) {
				const lastButtons = lastPad.buttons;
				const buttons = pad.buttons;
				const length = buttons.length;
				for (let code = 0; code < length; code++) {
					if (buttons[code].pressed && !lastButtons[code].pressed) {
						write(code);
						dispatchChangeEvent(root.value);
						break;
					}
				}
			}
			lastPad = Object.clone(pad);
		}
	};

	intervalIndex = setInterval(inputKeyCode);
};

const inputBlur = (): void => {
	if (intervalIndex !== null) {
		clearInterval(intervalIndex);
		intervalIndex = null;
	}
};

onMounted(() => {
	const inputEl = input.value;
	if (inputEl) {
		inputEl.addEventListener('keydown', inputKeydown);
		inputEl.addEventListener('focus', inputFocus);
		inputEl.addEventListener('blur', inputBlur);
	}
	const el = root.value as any;
	if (!el) {
		return;
	}
	el.read = read;
	el.write = write;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
});

onUnmounted(() => {
	inputBlur();
});

defineExpose({ read, write, enable, disable, getFocus, root });
</script>
