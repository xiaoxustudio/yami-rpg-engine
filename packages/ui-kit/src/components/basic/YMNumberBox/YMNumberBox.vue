<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';

interface Props {
	id?: string;
	modelValue?: number | string;
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
	unit: '',
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	change: [value: number];
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);
const unitEl = ref<HTMLElement | null>(null);

const state = {
	focusEventEnabled: false,
	blurEventEnabled: false
};

let decimalPlaces: number = Number(props.decimals);

const whiteList = new Set([
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
]);

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

const roundTo = (value: number, decimals: number): number => {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
};

const inputKeydown = (event: KeyboardEvent): void => {
	const cmdOrCtrlKey = event.ctrlKey || event.metaKey;
	if (!whiteList.has(event.code) && !cmdOrCtrlKey) {
		event.preventDefault();
	}
};

const onInputChange = (): void => {
	const input = inputEl.value;
	if (!input) return;
	input.value = String(read());
	const val = read();
	emit('update:modelValue', val);
	emit('change', val);
};

const onInputFocus = (event: FocusEvent): void => emit('focus', event);

const onInputBlur = (event: FocusEvent): void => emit('blur', event);

const read = (): number => {
	const el = inputEl.value;
	if (!el) return 0;
	const min = parseFloat(el.min);
	const max = parseFloat(el.max);
	let value = parseFloat(el.value) || 0;
	value = clamp(value, min, max);
	value = roundTo(value, decimalPlaces);
	return value;
};

const write = (value: string | number): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = String(value);
	el.value = String(read());
	(el as HTMLInputElement & { history?: { reset(): void } }).history?.reset();
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

const getFocus = (mode?: string): void => {
	const el = inputEl.value;
	if (!el) return;
	setTimeout(() => {
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
};

const measureText = (text: string, font: string): { width: number } => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) return { width: 0 };
	context.font = font;
	return context.measureText(text);
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener, options);
	switch (type) {
		case 'focus':
			if (!state.focusEventEnabled) {
				state.focusEventEnabled = true;
				inputEl.value?.addEventListener('focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!state.blurEventEnabled) {
				state.blurEventEnabled = true;
				inputEl.value?.addEventListener('blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

type NumberBoxHost = HTMLElement & {
	input: HTMLInputElement | null;
	read: typeof read;
	write: typeof write;
	enable: typeof enable;
	disable: typeof disable;
	getFocus: typeof getFocus;
	on: typeof on;
};

defineExpose({ read, write, enable, disable, getFocus, on, input: inputEl, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value;
	const input = inputEl.value;
	const unitElement = unitEl.value;
	if (!el || !input) return;
	if (el.childNodes.length > 1) {
		const labelNode = Array.from(el.childNodes).find(
			(n: ChildNode) =>
				n.nodeType !== Node.COMMENT_NODE &&
				n !== unitElement &&
				(n.nodeType === Node.ELEMENT_NODE || (n.textContent ?? '').trim() !== '')
		);
		const label = labelNode ? String(labelNode.textContent ?? '').trim() : '';
		if (label) {
			const font =
				labelNode instanceof HTMLElement
					? getComputedStyle(labelNode).font
					: 'var(--ym-font-mono)';
			const padding = measureText(label, font).width + 8;
			input.style.paddingLeft = `${padding}px`;
		}
	}
	if (unitElement) {
		input.style.paddingRight = `${unitElement.offsetWidth}px`;
	}
	(el as NumberBoxHost).input = input;
	attachApi(el, { read, write, enable, disable, getFocus, on });
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

<template>
	<div ref="root" class="number-box" :id="props.id">
		<slot />
		<div v-if="props.unit" ref="unitEl" class="unit text">{{ props.unit }}</div>
		<input
			ref="inputEl"
			class="number-box-input"
			type="number"
			:min="props.min"
			:max="props.max"
			:step="props.step"
			title=""
			@keydown="inputKeydown"
			@change="onInputChange"
			@focus="onInputFocus"
			@blur="onInputBlur"
		/>
	</div>
</template>

<style module>
:global(:where(.number-box)) {
	display: block;
	position: relative;
	width: auto;
	min-width: 60px;
	height: 20px;
	background-color: var(--ym-color-input-bg);
	border-top: 1px solid var(--ym-color-input-border);
	border-left: 1px solid var(--ym-color-input-border);
	border-right: 1px solid var(--ym-color-input-border);
	border-bottom: 1px solid var(--ym-color-input-border);
	border-radius: 2px;
	overflow: hidden;
}

:global(:where(.number-box.disabled)) {
	pointer-events: none;
	background-color: var(--ym-color-input-bg-disabled);
}

:global(:where(.number-box:focus-within)) {
	border-color: var(--ym-color-input-border-focus);
}

:global(:where(.number-box > .label)) {
	position: absolute;
	padding: 0 4px;
	left: 0;
	line-height: 18px;
	font-family: var(--ym-font-mono);
	color: var(--ym-color-text-unit);
}

:global(:where(.number-box > .label.red)) {
	color: var(--ym-color-danger);
}

:global(:where(.number-box > .label.green)) {
	color: #00c000;
}

:global(:where(.number-box > .label.blue)) {
	color: #0000ff;
}

:global(:where(.number-box > .unit)) {
	position: absolute;
	padding: 0 4px;
	right: 0;
	line-height: 18px;
	font-family: var(--ym-font-mono);
	color: var(--ym-color-text-unit);
}

:global(:where(.number-box-input)) {
	position: absolute;
	margin: 0;
	padding: 4px;
	width: 100%;
	height: 100%;
	background-color: transparent;
	border: none;
}

:global(::-webkit-inner-spin-button) {
	appearance: none;
}
</style>
