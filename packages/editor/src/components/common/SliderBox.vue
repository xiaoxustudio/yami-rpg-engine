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
		:label="props.label"
		@input="onInput"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { YMSliderBox } from '@ui-kit';
import { addClass, removeClass, hideChildNodes, showChildNodes } from '@app/utils/element-utils';
import { elementDataOf } from '@ui-kit';

/** 与滑块联动的数字框：只认组件实例的能力（`defineExpose`），不再读写元素上的方法。 */
interface SyncTarget {
	read?: () => number;
	write(value: number | string): void;
	inputEl?: HTMLInputElement | null;
	root?: HTMLElement | null;
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
	label?: string;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	min: '0',
	max: '0',
	step: '1',
	hotkey: '',
	activeWheel: false,
	disabled: false,
	label: ''
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

/** 双向同步的写口：`write` 负责页面事件，`writeRaw` 只写控件，避免两边互相触发递归。 */
let syncToNumber: (() => void) | null = null;

const writeRaw = (value: number | string): void => {
	ym.value?.write(value);
	emit('update:modelValue', ym.value?.read() ?? 0);
};

const write = (value: number | string): void => {
	writeRaw(value);
	syncToNumber?.();
};

const read = (): number => ym.value?.read() ?? 0;

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

/**
 * 让滑块与数字框互相跟随。
 *
 * 旧实现在元素上互相改写 `write`；现在两侧都是组件实例：slider 侧用 `writeRaw` +
 * `syncToNumber` 钩子，number 侧覆盖实例暴露的 `write`（暴露对象可写），避免递归。
 */
const synchronize = (target: SyncTarget | null): void => {
	const el = root.value;
	const sliderInput = input.value;
	const numberInput = target?.inputEl ?? null;
	if (!el || !sliderInput || !target || !numberInput) return;
	const sliderData = elementDataOf<{ synchronizer?: unknown }>(el);
	if (sliderData.synchronizer) return;

	const writeNumberRaw = target.write.bind(target);
	sliderData.synchronizer = target;

	sliderInput.addEventListener('pointerdown', () => sliderInput.focus());
	sliderInput.addEventListener('input', () => {
		writeNumberRaw(read());
		target.root?.dispatchEvent(new Event('input'));
	});
	numberInput.addEventListener('input', () => {
		writeRaw(target.read?.() ?? 0);
		el.dispatchEvent(new Event('input'));
	});

	target.write = (value: number | string) => {
		writeNumberRaw(value);
		writeRaw(target.read?.() ?? 0);
		el.dispatchEvent(new Event('input'));
	};
	syncToNumber = () => {
		writeNumberRaw(read());
		target.root?.dispatchEvent(new Event('input'));
	};
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

defineExpose({ read, write, enable, disable, updateFiller, synchronize, on, root, input });

watch(
	() => props.disabled,
	(val) => (val ? disable() : enable())
);

onMounted(() => {
	if (props.disabled) disable();
});
</script>
