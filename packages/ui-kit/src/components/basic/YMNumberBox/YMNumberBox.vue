<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

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

const write = (value: any): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = String(value);
	el.value = String(read());
	(el as any).history?.reset();
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

const getFocus = (mode: any): void => {
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
	listener: (event: any) => void,
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
	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('change', () => {
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
	if (props.unit !== null && props.unit !== undefined && props.unit !== '') {
		const unitText = document.createElement('div');
		const font = 'var(--font-family-mono)';
		const padding = measureText(props.unit, font).width + 8;
		unitText.className = 'unit text';
		unitText.textContent = props.unit;
		el.insertBefore(unitText, input);
		input.style.paddingRight = `${padding}px`;
	}
	(el as any).input = input;
	(el as any).read = read;
	(el as any).write = write;
	(el as any).enable = enable;
	(el as any).disable = disable;
	(el as any).getFocus = getFocus;
	(el as any).on = on;
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
		<input ref="inputEl" class="number-box-input" type="number" />
	</div>
</template>

<style module>
:global(.number-box) {
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

:global(.number-box.disabled) {
	pointer-events: none;
	background-color: var(--ym-color-input-bg-disabled);
}

:global(.number-box:focus-within) {
	border-color: var(--ym-color-input-border-focus);
}

:global(.number-box > .label) {
	position: absolute;
	padding: 0 4px;
	left: 0;
	line-height: 18px;
	font-family: var(--ym-font-mono);
	color: var(--ym-color-text-unit);
}

:global(.number-box > .label.red) {
	color: var(--ym-color-danger);
}

:global(.number-box > .label.green) {
	color: #00c000;
}

:global(.number-box > .label.blue) {
	color: #0000ff;
}

:global(.number-box > .unit) {
	position: absolute;
	padding: 0 4px;
	right: 0;
	line-height: 18px;
	font-family: var(--ym-font-mono);
	color: var(--ym-color-text-unit);
}

:global(.number-box-input) {
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
