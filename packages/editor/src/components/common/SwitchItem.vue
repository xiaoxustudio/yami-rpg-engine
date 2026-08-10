<template>
	<YMSwitchItem
		ref="ym"
		:model-value="dataValue"
		:length="props.length"
		:disabled="isDisabled"
		:id="props.id"
		@update:model-value="input"
	/>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { YMSwitchItem } from '@ui-kit';

interface SwitchItemElement extends HTMLDivElement {
	read(): number;
	write(value: number): void;
	update(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: number;
	inputEventEnabled: boolean;
}

interface Props {
	id?: string;
	length?: number;
	modelValue?: number;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	length: 1,
	modelValue: 0,
	disabled: false
});

const dataValue = ref(props.modelValue % props.length);
const inputEventEnabled = ref(false);
const isDisabled = ref(props.disabled);
const ym = ref<{ root: HTMLElement | null } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const read = (): number => dataValue.value;

const write = (value: number): void => {
	dataValue.value = value % props.length;
};

const update = (): void => {};

const input = (value: number): void => {
	dataValue.value = value % props.length;
	if (inputEventEnabled.value) {
		const inputEvent = new Event('input');
		inputEvent.value = dataValue.value;
		root.value?.dispatchEvent(inputEvent);
	}
};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
	if (type === 'input') inputEventEnabled.value = true;
};

defineExpose({ read, write, update, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (isDisabled.value = val));

onMounted(() => {
	const el = root.value as SwitchItemElement | null;
	if (!el) return;
	el.read = read;
	el.write = write;
	el.update = update;
	el.on = on;
	Object.defineProperty(el, 'dataValue', {
		get: () => dataValue.value,
		set: (value: number) => {
			dataValue.value = value;
		},
		configurable: true
	});
	Object.defineProperty(el, 'inputEventEnabled', {
		get: () => inputEventEnabled.value,
		set: (value: boolean) => {
			inputEventEnabled.value = value;
		},
		configurable: true
	});
});
</script>
