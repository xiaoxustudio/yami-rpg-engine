<template>
	<div ref="root" class="slider-box" :id="props.id" :hotkey="props.hotkey || undefined" />
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import {
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	read as readElement
} from '@/util/element-utils';

interface SliderBoxElement extends HTMLElement {
	filler: HTMLElement;
	input: HTMLInputElement;
	synchronizer: HTMLElement & { value: any; [k: string]: any };
	bar: HTMLElement & { [k: string]: any };
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	read(): number;
	write(value: any): void;
	enable(): void;
	disable(): void;
	updateFiller(): void;
	synchronize(target: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

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
	focus: [event: FocusEvent];
	blur: [event: FocusEvent];
}>();

const root = ref<SliderBoxElement | null>(null);

const state = reactive({
	focusEventEnabled: false,
	blurEventEnabled: false
});

let filler: HTMLElement | null = null;
let input: HTMLInputElement | null = null;

const read = (): number => (input ? parseFloat(input.value) : 0);

const updateFiller = (): void => {
	if (!filler || !input) return;
	const value = read();
	if ((filler as any).value !== value) {
		(filler as any).value = value;
		const min = parseFloat(input.min);
		const max = parseFloat(input.max);
		if (min !== max) {
			const p = Math.roundTo(((value - min) * 100) / (max - min), 6);
			filler.style.width = `${p}%`;
		}
	}
};

const write = (value: any): void => {
	if (!input) return;
	input.value = value;
	updateFiller();
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

const synchronize = (target: any): void => {
	const el = root.value;
	if (!el) return;
	const slider = el as SliderBoxElement;
	const number = target;
	if (slider.synchronizer) {
		return;
	}

	if (number instanceof HTMLElement && number.classList.contains('number-box')) {
		const writeSlider = slider.write;
		const writeNumber = number.write;

		const sliderPointerdown = () => {
			slider.input.focus();
		};

		const sliderInput = (event?: any) => {
			writeNumber.call(number, readElement(slider));
			event && number.dispatchEvent(new Event('input'));
		};

		const numberInput = (event?: any) => {
			writeSlider.call(slider, readElement(number));
			event && slider.dispatchEvent(new Event('input'));
		};

		slider.synchronizer = target;

		slider.input.addEventListener('pointerdown', sliderPointerdown);
		slider.input.addEventListener('input', sliderInput);
		number.input.addEventListener('input', numberInput);

		slider.write = (value) => {
			writeSlider.call(slider, value);
			sliderInput();
		};

		number.write = (value) => {
			writeNumber.call(number, value);
			numberInput();
		};
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
		case 'focus':
			if (!state.focusEventEnabled) {
				state.focusEventEnabled = true;
				input?.addEventListener('focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!state.blurEventEnabled) {
				state.blurEventEnabled = true;
				input?.addEventListener('blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

defineExpose({ read, write, enable, disable, synchronize, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));
watch(() => props.activeWheel, (val) => {
	if (root.value) root.value.activeWheel = val;
});

onMounted(() => {
	const el = root.value;
	if (!el) return;

	const bar = document.createElement('slider-bar');
	const fillerEl = document.createElement('slider-filler');
	bar.appendChild(fillerEl);

	const inputEl = document.createElement('input');
	addClass(inputEl, 'slider-input');
	inputEl.type = 'range';
	inputEl.tabIndex = -1;
	inputEl.min = String(props.min);
	inputEl.max = String(props.max);
	inputEl.step = String(props.step);

	filler = fillerEl;
	input = inputEl;

	el.appendChild(bar);
	el.appendChild(inputEl);

	el.bar = bar;
	el.filler = fillerEl;
	el.input = inputEl;
	el.synchronizer = null;
	el.focusEventEnabled = false;
	el.blurEventEnabled = false;
	el.activeWheel = props.activeWheel;
	el.read = read;
	el.write = write;
	el.enable = enable;
	el.disable = disable;
	el.updateFiller = updateFiller;
	el.synchronize = synchronize;
	el.on = on;

	el.addEventListener('input', () => {
		updateFiller();
		const value = read();
		emit('input', value);
		emit('update:modelValue', value);
	});

	inputEl.addEventListener('wheel', (event) => {
		if (event.deltaY === 0) return;
		if (el.activeWheel) {
			event.preventDefault();
			const last = inputEl.value;
			inputEl.value = String(
				Math.roundTo(parseFloat(inputEl.value) + parseFloat(inputEl.step) * (event.deltaY > 0 ? -1 : 1), 2)
			);
			if (inputEl.value !== last) {
				inputEl.dispatchEvent(
					new Event('input', {
						bubbles: true
					})
				);
			}
		}
	});

	write(props.modelValue);
	if (props.disabled) disable();
});
</script>
