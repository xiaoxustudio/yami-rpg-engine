<template>
	<div class="number-box" ref="root" :id="props.id">
		<slot />
		<input ref="inputEl" class="number-box-input" type="number" />
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import {
	on as onElement,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus as getFocusElement
} from '@/util/element-utils';
import { NumberHistory } from '@/components/number-history';
import { measureText } from '@/util/dom';

interface NumberBoxElement extends HTMLElement {
	input: HTMLInputElement;
	decimals: number;
	read(): number;
	write(value: any): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: number;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	decimals?: number | string;
	unit?: string;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	min: '0',
	max: '0',
	step: '1',
	decimals: 0,
	unit: null,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	change: [value: number];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<NumberBoxElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const state = {
	focusEventEnabled: false,
	blurEventEnabled: false
};

let decimalPlaces: number = Number(props.decimals);

const whiteList = [
	'Digit0',
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Minus',
	'Period',
	'Numpad0',
	'Numpad1',
	'Numpad2',
	'Numpad3',
	'Numpad4',
	'Numpad5',
	'Numpad6',
	'Numpad7',
	'Numpad8',
	'Numpad9',
	'NumpadSubtract',
	'NumpadDecimal',
	'Backspace',
	'Delete',
	'Tab',
	'Enter',
	'ArrowLeft',
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'Home',
	'End',
	'NumpadEnter'
];

const inputKeydown = (event: any): void => {
	!whiteList.includes(event.code) && !event.cmdOrCtrlKey && event.preventDefault();
};

const read = (): number => {
	const el = inputEl.value;
	if (!el) return 0;
	const min = parseFloat(el.min);
	const max = parseFloat(el.max);
	let value = parseFloat(el.value) || 0;
	value = Math.clamp(value, min, max);
	value = Math.roundTo(value, decimalPlaces);
	return value;
};

const write = (value: any): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = String(value);
	el.value = String(read());
	el.history.reset();
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

const getFocus = (mode: any): void => {
	getFocusElement(inputEl.value, mode);
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
		case 'focus':
			if (!state.focusEventEnabled) {
				state.focusEventEnabled = true;
				onElement(inputEl.value, 'focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!state.blurEventEnabled) {
				state.blurEventEnabled = true;
				onElement(inputEl.value, 'blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

defineExpose({ read, write, enable, disable, getFocus, on, input: inputEl, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	const input = inputEl.value;
	if (!el || !input) return;
	input.min = String(props.min);
	input.max = String(props.max);
	input.step = String(props.step);
	input.title = '';
	input.history = new NumberHistory(input);
	onElement(input, 'keydown', inputKeydown);
	onElement(input, 'change', () => {
		input.value = String(read());
		const val = read();
		emit('update:modelValue', val);
		emit('change', val);
	});
	input.addEventListener('focus', (e: FocusEvent) => emit('focus', e));
	input.addEventListener('blur', (e: FocusEvent) => emit('blur', e));
	if (el.childNodes.length > 1) {
		const labelNode = Array.from(el.childNodes).find(
			(n: any) => n.nodeType === Node.ELEMENT_NODE || (n.textContent ?? '').trim() !== ''
		);
		const label = labelNode ? String(labelNode.textContent ?? '').trim() : '';
		if (label) {
			const font = 'var(--font-family-mono)';
			const padding = measureText(label, font).width + 8;
			input.style.paddingLeft = `${padding}px`;
		}
	}
	if (props.unit !== null) {
		const unitText = document.createElement('text');
		const font = 'var(--font-family-mono)';
		const padding = measureText(props.unit, font).width + 8;
		addClass(unitText, 'unit');
		unitText.textContent = props.unit;
		el.insertBefore(unitText, input);
		input.style.paddingRight = `${padding}px`;
	}
	el.input = input;
	el.read = read;
	el.write = write;
	el.enable = enable;
	el.disable = disable;
	el.getFocus = getFocus;
	el.on = on;
	Object.defineProperty(el, 'decimals', {
		get: (): number => decimalPlaces,
		set: (value: number): void => {
			decimalPlaces = Number(value);
		}
	});
	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
