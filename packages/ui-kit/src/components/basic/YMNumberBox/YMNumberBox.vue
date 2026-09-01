<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';
import { createNumberBoxCore } from './number-box-core';

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

const core = createNumberBoxCore(
	{
		getRoot: () => root.value,
		getInput: () => inputEl.value
	},
	state
);
const { inputKeydown, readValue, enable, disable, getFocus, on } = core;

const read = (): number => readValue(decimalPlaces);

const write = (value: string | number): void => {
	core.write(value, decimalPlaces);
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

const measureText = (text: string, font: string): { width: number } => {
	const canvas = document.createElement('canvas');
	const context = canvas.getContext('2d');
	if (!context) return { width: 0 };
	context.font = font;
	return context.measureText(text);
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

watch(
	() => props.modelValue,
	(val) => write(val)
);
watch(
	() => props.disabled,
	(val) => (val ? disable() : enable())
);

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
	font-family: var(--ym-font-sans);
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text);
}

:global(::-webkit-inner-spin-button) {
	appearance: none;
}
</style>
