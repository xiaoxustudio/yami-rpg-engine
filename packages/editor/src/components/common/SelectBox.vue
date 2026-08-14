<template>
	<YMSelectBox
		ref="ym"
		:model-value="props.modelValue"
		:items="props.items"
		:disabled="isDisabled"
		:popup="false"
		:id="props.id"
		@open="onOpen"
		@input="onInput"
		@write="onWrite"
		@change="onChange"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMSelectBox } from '@ui-kit';
import {
	setTooltip as setTooltipElement,
	dispatchChangeEvent
} from '@/util/element-utils';
import { Select } from '@/components/select-list.ts';
import { Local } from '@/tools/localization.ts';
import { attachElementApi } from '@/utils/attach-element-api';

interface SelectBoxElement extends HTMLElement {
	info: HTMLElement & { [k: string]: unknown };
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	writeDefault(): void;
	input(value: unknown): void;
	update(): void;
	reselect(offset: number): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: unknown[]): void;
	setItemNames(options: Record<string, string | { name?: string; tip?: string }>): void;
	setTooltip(tip: string | (() => string)): void;
	createTooltip(): void;
	clear(): HTMLElement;
	enableHiddenMode(): HTMLElement;
	relate(entries: unknown): void;
	toggleRelatedElements(): void;
	enableElement(element: unknown): void;
	disableElement(element: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => [],
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	write: [value: unknown];
	input: [value: unknown];
	change: [value: unknown];
}>();

const isDisabled = ref(props.disabled);
let originalTip = '';

const ym = ref<{
	root: HTMLElement | null;
	read(): unknown;
	write(value: unknown): void;
	write2(value: unknown): void;
	writeDefault(): void;
	input(value: unknown): void;
	update(): void;
	reselect(offset: number): void;
	save(): void;
	restore(): void;
	enable(): void;
	disable(): void;
	loadItems(items: unknown[]): void;
	setItemNames(options: Record<string, string | { name?: string; tip?: string }>): void;
	clear(): HTMLElement;
	enableHiddenMode(): HTMLElement;
	relate(entries: unknown): void;
	toggleRelatedElements(): void;
	enableElement(element: unknown): void;
	disableElement(element: unknown): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
} | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): unknown => ym.value?.read();
const write = (value: unknown): void => ym.value?.write(value);
const write2 = (value: unknown): void => ym.value?.write2(value);
const writeDefault = (): void => ym.value?.writeDefault();
const input = (value: unknown): void => ym.value?.input(value);
const update = (): void => ym.value?.update();
const reselect = (offset: number): void => ym.value?.reselect(offset);
const save = (): void => ym.value?.save();
const restore = (): void => ym.value?.restore();
const enable = (): void => ym.value?.enable();
const disable = (): void => ym.value?.disable();
const loadItems = (items: unknown[]): void => ym.value?.loadItems(items);
const setItemNames = (
	options: Record<string, string | { name?: string; tip?: string }>
): void => {
	const mapped: Record<string, string | { name?: string; tip?: string }> = {};
	for (const key of Object.keys(options ?? {})) {
		const option = options[key];
		if (typeof option === 'string') {
			mapped[key] = option;
		} else if (option && typeof option === 'object') {
			const copy: { name?: string; tip?: string } = { ...option };
			if ('tip' in copy) {
				copy.tip = Local.parseTip(copy.tip, copy.name);
			}
			mapped[key] = copy;
		}
	}
	ym.value?.setItemNames(mapped);
	createTooltip();
};
const clear = (): HTMLElement => ym.value?.clear() as HTMLElement;
const enableHiddenMode = (): HTMLElement => ym.value?.enableHiddenMode() as HTMLElement;
const relate = (entries: unknown): void => ym.value?.relate(entries);
const toggleRelatedElements = (): void => ym.value?.toggleRelatedElements();
const enableElement = (element: unknown): void => ym.value?.enableElement(element);
const disableElement = (element: unknown): void => ym.value?.disableElement(element);
const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => ym.value?.on(type, listener, options);

const setTooltip = (tip: string | (() => string)): void => {
	const el = root.value;
	if (!el) return;
	originalTip = tip as string;
	setTooltipElement(el, tip);
};

const createTooltip = (): void => {
	const el = root.value;
	if (!el) return;
	let tip = originalTip ?? '';
	let options = '';
	const items = (el as HTMLElement & { dataItems?: Array<{ tip?: string }> | null }).dataItems ?? [];
	for (const item of items) {
		if (item.tip) {
			options += item.tip + '\n';
		}
	}
	if (tip === '' && options !== '') {
		const prev = el.previousElementSibling;
		if (prev && prev.classList.contains('text')) {
			tip += `<b>${prev.textContent}</b>`;
		}
	}
	if (tip !== '' && options !== '') {
		tip += '<tooltip-line></tooltip-line>';
	}
	tip += options;
	if (tip !== '') {
		setTooltipElement(el, tip.trim());
	}
};

const openSelect = (): void => {
	const el = root.value;
	if (!el || isDisabled.value) return;
	Select.open(el);
};

const onOpen = (): void => {
	openSelect();
};

const onInput = (value: unknown): void => {
	emit('input', value);
	emit('update:modelValue', value);
};

const onWrite = (value: unknown): void => emit('write', value);

const onChange = (value: unknown): void => emit('change', value);

defineExpose({
	read,
	write,
	write2,
	writeDefault,
	input,
	update,
	reselect,
	save,
	restore,
	enable,
	disable,
	loadItems,
	setItemNames,
	setTooltip,
	createTooltip,
	clear,
	enableHiddenMode,
	relate,
	toggleRelatedElements,
	enableElement,
	disableElement,
	on,
	root
});

watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as SelectBoxElement | null;
	if (!el) return;
	attachElementApi(el, {
		read,
		write,
		write2,
		writeDefault,
		input,
		update,
		reselect,
		save,
		restore,
		enable,
		disable,
		loadItems,
		setItemNames,
		setTooltip,
		createTooltip,
		clear,
		enableHiddenMode,
		relate,
		toggleRelatedElements,
		enableElement,
		disableElement,
		on
	});
	dispatchChangeEvent(el);
	if (props.disabled) disable();
});
</script>
