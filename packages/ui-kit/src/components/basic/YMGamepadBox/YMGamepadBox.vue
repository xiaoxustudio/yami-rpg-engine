<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { attachApi } from '../../../utils/attach-api';

interface Props {
	id?: string;
	label?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '', label: '' });

const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);

let dataValue: number | null = null;
let intervalIndex: ReturnType<typeof setInterval> | null = null;

const codeToName: Record<number, string> = {
	0: 'A',
	1: 'B',
	2: 'X',
	3: 'Y',
	4: 'LB',
	5: 'RB',
	6: 'LT',
	7: 'RT',
	8: 'View',
	9: 'Menu',
	10: 'LS',
	11: 'RS',
	12: 'Up',
	13: 'Down',
	14: 'Left',
	15: 'Right'
};

const getButtonName = (code: number): string =>
	code === -1 ? '' : (codeToName[code] ?? `Button_${code}`);

const read = (): number | null => dataValue;

const write = (button: number): void => {
	dataValue = button;
	if (input.value) {
		input.value.value = getButtonName(button);
	}
};

const enable = (): void => {
	const el = root.value;
	if (!el) return;
	el.classList.remove('disabled');
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = '';
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	el.classList.add('disabled');
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = 'none';
	}
};

const getFocus = (mode: string): HTMLInputElement | null => {
	const el = input.value;
	setTimeout(() => {
		if (!el) return;
		el.focus();
		switch (mode) {
			case 'all':
				el.select();
				el.scrollLeft = 0;
				break;
			case 'end':
				if (typeof el.selectionStart === 'number') {
					el.setSelectionRange(el.value.length, el.value.length);
					el.scrollLeft = el.scrollWidth;
				}
				break;
		}
	});
	return el;
};

const inputKeydown = (event: KeyboardEvent): void => {
	switch (event.code) {
		case 'Tab':
			break;
		case 'Backspace':
			event.preventDefault();
			write(-1);
			root.value?.dispatchEvent(new Event('change', { bubbles: true }));
			break;
		default:
			event.preventDefault();
			break;
	}
};

const clonePad = (pad: Gamepad): Gamepad => {
	const clone = {} as Gamepad;
	for (const key of Object.keys(pad)) {
		Reflect.set(clone, key, Reflect.get(pad, key));
	}
	Reflect.set(
		clone,
		'buttons',
		Array.from(pad.buttons, (button) => ({ ...button }))
	);
	return clone;
};

const inputFocus = (): void => {
	let lastPad: Gamepad | null = null;

	const inputKeyCode = () => {
		const pads = navigator.getGamepads();
		const pad = pads[0] || pads[1] || pads[2] || pads[3] || null;
		if (pad !== null) {
			if (lastPad === null) {
				lastPad = clonePad(pad);
				for (const button of lastPad.buttons) {
					Reflect.set(button, 'pressed', false);
					Reflect.set(button, 'value', 0);
				}
			}
			if (lastPad.id === pad.id) {
				const lastButtons = lastPad.buttons;
				const buttons = pad.buttons;
				const length = buttons.length;
				for (let code = 0; code < length; code++) {
					if (buttons[code].pressed && !lastButtons[code].pressed) {
						write(code);
						root.value?.dispatchEvent(new Event('change', { bubbles: true }));
						break;
					}
				}
			}
			lastPad = clonePad(pad);
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
	const el = root.value as HTMLElement & { [k: string]: unknown };
	if (!el) return;
	attachApi(el, { read, write, enable, disable, getFocus });
});

onUnmounted(() => {
	inputBlur();
});

defineExpose({ read, write, enable, disable, getFocus, root });
</script>

<template>
	<div ref="root" class="gamepad-box" :class="$style.box" :id="props.id">
		<input
			class="gamepad-box-input"
			:class="$style.input"
			ref="input"
			type="text"
			:aria-label="props.label || undefined"
			@keydown="inputKeydown"
			@focus="inputFocus"
			@blur="inputBlur"
		/>
	</div>
</template>

<style module>
.box {
	display: block;
	position: relative;
	width: auto;
	height: 20px;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
}

.box:global(:where(.disabled)) {
	pointer-events: none;
	background-color: var(--input-background-disabled);
}

.box:focus-within {
	border-color: var(--input-border-color-focus);
}

.input {
	position: absolute;
	margin: 0;
	padding: 4px;
	width: 100%;
	height: 100%;
	background-color: transparent;
	border: none;
}
</style>
