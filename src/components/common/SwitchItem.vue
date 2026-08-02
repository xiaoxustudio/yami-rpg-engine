<template>
	<div
		ref="root"
		:id="props.id"
		:class="stateClass"
		@pointerdown="pointerdown"
	/>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';

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

const classes = ['zero', 'one', 'two', 'three'];

const root = ref<HTMLDivElement | null>(null);
const length = computed(() => Math.clamp(props.length, 1, 4));
const dataValue = ref(props.modelValue % length.value);
const inputEventEnabled = ref(false);
const stateClass = computed(() => classes[dataValue.value]);

const read = (): number => dataValue.value;

const write = (value: number): void => {
	dataValue.value = value % length.value;
};

const update = (): void => {};

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
	if (type === 'input') inputEventEnabled.value = true;
};

const pointerdown = (event: PointerEvent): void => {
	if (props.disabled) return;
	if (event.button !== 0) return;
	write((dataValue.value + 1) % length.value);
	if (inputEventEnabled.value) {
		const input = new Event('input');
		(input as any).value = dataValue.value;
		root.value?.dispatchEvent(input);
	}
};

defineExpose({ read, write, update, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => root.value?.classList.toggle('disabled', val));

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
	if (props.disabled) el.classList.add('disabled');
});
</script>
