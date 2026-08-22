<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

interface Props {
	id?: string;
	modelValue?: number | string;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	hotkey?: string;
	activeWheel?: boolean;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	id: undefined,
	modelValue: 0,
	min: '0',
	max: '0',
	step: '1',
	hotkey: '',
	activeWheel: false,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	input: [value: number];
}>();

const root = ref<HTMLElement | null>(null);
const bar = ref<HTMLElement | null>(null);
const filler = ref<HTMLElement | null>(null);
const inputEl = ref<HTMLInputElement | null>(null);

const read = (): number => {
	const el = inputEl.value;
	return el ? parseFloat(el.value) : 0;
};

const updateFiller = (): void => {
	const el = inputEl.value;
	const fill = filler.value;
	if (!el || !fill) return;
	const value = read();
	const min = parseFloat(el.min);
	const max = parseFloat(el.max);
	if (min !== max) {
		const p = ((value - min) * 100) / (max - min);
		fill.style.width = `${Math.round(p * 1000000) / 1000000}%`;
	}
};

const write = (value: number | string): void => {
	const el = inputEl.value;
	if (!el) return;
	el.value = String(value);
	updateFiller();
};

const onInput = (): void => {
	updateFiller();
	const value = read();
	emit('input', value);
	emit('update:modelValue', value);
};

const onWheel = (event: WheelEvent): void => {
	if (!props.activeWheel || event.deltaY === 0) return;
	const el = inputEl.value;
	if (!el) return;
	event.preventDefault();
	const last = el.value;
	const step = parseFloat(el.step) || 1;
	el.value = String(
		Math.round((parseFloat(el.value) + step * (event.deltaY > 0 ? -1 : 1)) * 100) / 100
	);
	if (el.value !== last) {
		el.dispatchEvent(new Event('input', { bubbles: true }));
	}
};

watch(() => props.modelValue, (val) => write(val));

onMounted(() => {
	write(props.modelValue);
});

defineExpose({ root, bar, filler, input: inputEl, read, write, updateFiller });
</script>

<template>
	<div
		ref="root"
		class="slider-box"
		:class="[$style.box, { disabled }]"
		:id="props.id"
		:hotkey="hotkey || undefined"
	>
		<div ref="bar" class="slider-bar" :class="$style.bar">
			<div ref="filler" class="slider-filler" :class="$style.filler" />
		</div>
		<input
			ref="inputEl"
			class="slider-input"
			:class="$style.input"
			type="range"
			:min="min"
			:max="max"
			:step="step"
			tabindex="-1"
			:disabled="disabled"
			@input="onInput"
			@wheel="onWheel"
		/>
	</div>
</template>

<style module>
.box {
	position: relative;
	display: block;
	width: 100%;
	height: 20px;
}

.box:global(:where(.disabled)) {
	opacity: 0.5;
	pointer-events: none;
}

.bar {
	position: absolute;
	margin-top: auto;
	margin-bottom: auto;
	top: 0;
	bottom: 0;
	width: 100%;
	height: 4px;
	background-color: var(--slider-bar-background);
	border: 1px solid var(--ym-color-input-border);
	border-radius: var(--ym-radius-sm);
}

.filler {
	position: absolute;
	height: 100%;
	background-color: var(--slider-filler-background);
}

.input {
	position: absolute;
	margin: 0;
	width: 100%;
	height: 20px;
	border: none;
	background-color: transparent;
	appearance: none;
}

.input:global(::-webkit-slider-runnable-track) {
	background: transparent;
	border: none;
}

.input:global(::-webkit-slider-thumb) {
	width: 16px;
	height: 16px;
	background-color: var(--slider-thumb-background);
	border: 1px solid var(--ym-color-input-border);
	border-radius: 8px;
	appearance: none;
}

.input:global(::-moz-range-track) {
	background: transparent;
	border: none;
}

.input:global(::-moz-range-thumb) {
	width: 14px;
	height: 14px;
	background-color: var(--slider-thumb-background);
	border: 1px solid var(--ym-color-input-border);
	border-radius: 8px;
}
</style>
