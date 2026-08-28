<template>
	<YMSliderBox
		ref="ym"
		:model-value="props.modelValue"
		:min="props.min"
		:max="props.max"
		:step="props.step"
		:hotkey="props.hotkey"
		:active-wheel="props.activeWheel"
		:disabled="isDisabled"
		:id="props.id"
		@input="onInput"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { YMSliderBox } from '@ui-kit';
import {
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	read as readElement
} from '@app/utils/element-utils';
import { attachElementApi } from '@app/utils/attach-element-api';

interface SliderBoxElement extends HTMLElement {
	filler: HTMLElement;
	input: HTMLInputElement;
	synchronizer: HTMLElement & { write(value: number | string): void; input: HTMLInputElement };
	bar: HTMLElement;
	activeWheel: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	read(): number;
	write(value: number | string): void;
	enable(): void;
	disable(): void;
	updateFiller(): void;
	synchronize(
		target: HTMLElement & { write(value: number | string): void; input: HTMLInputElement }
	): void;
	on(
		type: string,
		listener: (event: Event) => void,
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

const isDisabled = ref(props.disabled);
const state = reactive({
	focusEventEnabled: false,
	blurEventEnabled: false
});

const ym = ref<{
	root: HTMLElement | null;
	bar: HTMLElement | null;
	filler: HTMLElement | null;
	input: HTMLInputElement | null;
	read(): number;
	write(value: number | string): void;
	updateFiller(): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);
const input = computed<HTMLInputElement | null>(() => ym.value?.input ?? null);

const read = (): number => ym.value?.read() ?? 0;

const write = (value: number | string): void => {
	ym.value?.write(value);
	emit('update:modelValue', ym.value?.read() ?? 0);
};

const updateFiller = (): void => ym.value?.updateFiller();

const enable = (): void => {
	const el = root.value;
	if (el && isDisabled.value) {
		isDisabled.value = false;
		removeClass(el, 'disabled');
		showChildNodes(el);
	}
};

const disable = (): void => {
	const el = root.value;
	if (el && !isDisabled.value) {
		isDisabled.value = true;
		addClass(el, 'disabled');
		hideChildNodes(el);
	}
};

const synchronize = (
	target: HTMLElement & { write(value: number | string): void; input: HTMLInputElement }
): void => {
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

		const sliderInput = (event?: Event) => {
			writeNumber.call(number, readElement(slider));
			if (event) number.dispatchEvent(new Event('input'));
		};

		const numberInput = (event?: Event) => {
			writeSlider.call(slider, readElement(number));
			if (event) slider.dispatchEvent(new Event('input'));
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
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	const el = root.value;
	if (!el) return;
	el.addEventListener(type, listener as EventListener, options);
	switch (type) {
		case 'focus':
			if (!state.focusEventEnabled) {
				state.focusEventEnabled = true;
				input.value?.addEventListener('focus', () => {
					el.dispatchEvent(new FocusEvent('focus'));
				});
			}
			break;
		case 'blur':
			if (!state.blurEventEnabled) {
				state.blurEventEnabled = true;
				input.value?.addEventListener('blur', () => {
					el.dispatchEvent(new FocusEvent('blur'));
				});
			}
			break;
	}
};

const onInput = (value: number): void => {
	emit('input', value);
	emit('update:modelValue', value);
};

defineExpose({ read, write, enable, disable, synchronize, on, root });

const api = {
	bar: null as HTMLElement | null,
	filler: null as HTMLElement | null,
	input: null as HTMLInputElement | null,
	synchronizer: null,
	focusEventEnabled: false,
	blurEventEnabled: false,
	activeWheel: props.activeWheel,
	read,
	write,
	enable,
	disable,
	updateFiller,
	synchronize,
	on
};

watch(
	() => props.disabled,
	(val) => (val ? disable() : enable())
);
watch(
	() => props.activeWheel,
	(val) => {
		api.activeWheel = val;
	}
);

onMounted(() => {
	const el = root.value as SliderBoxElement | null;
	if (!el) return;
	const inputEl = input.value;
	const fillerEl = ym.value?.filler ?? null;
	const barEl = ym.value?.bar ?? null;

	api.bar = barEl as HTMLElement;
	api.filler = fillerEl as HTMLElement;
	api.input = inputEl as HTMLInputElement;
	api.activeWheel = props.activeWheel;
	attachElementApi(el, api);

	if (props.disabled) disable();
});
</script>
