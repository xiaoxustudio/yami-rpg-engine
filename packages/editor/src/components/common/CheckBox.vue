<template>
	<YMCheckBox
		ref="ym"
		:model-value="state.dataValue"
		:disabled="isDisabled"
		:standard="isStandard"
		:large="props.large"
		:id="props.id"
		@update:model-value="input"
	>
		<slot />
	</YMCheckBox>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, useAttrs, watch } from 'vue';
import { YMCheckBox } from '@ui-kit';
import {
	on as onElement,
	enable as enableElement,
	disable as disableElement,
	dispatchChangeEvent
} from '@/util/element-utils';
import { attachElementApi } from '@/utils/attach-element-api';

interface CheckBoxElement extends HTMLElement {
	read(): boolean;
	write(value: boolean): void;
	input(value: boolean): void;
	enable(): void;
	disable(): void;
	relate(elements: HTMLElement[]): void;
	on(
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	dataValue: boolean;
	relations: HTMLElement[];
}

interface Props {
	id?: string;
	standard?: boolean;
	large?: boolean;
	disabled?: boolean;
	modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	standard: false,
	large: false,
	disabled: false,
	modelValue: false
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	write: [value: boolean];
	input: [value: boolean];
	change: [value: boolean];
}>();

const state = reactive({
	dataValue: false,
	relations: [] as HTMLElement[],
	writeEventEnabled: false,
	inputEventEnabled: false
});

const isDisabled = ref(props.disabled);
const ym = ref<{ root: HTMLElement | null } | null>(null);
const root = computed<HTMLElement | null>(() => ym.value?.root ?? null);

const attrs = useAttrs();
const isStandard = computed(
	() =>
		props.standard ||
		(typeof attrs.class === 'string' && /\bstandard\b/.test(attrs.class))
);

const read = (): boolean => state.dataValue;

const write = (value: boolean): void => {
	const el = root.value;
	if (!el) return;
	state.dataValue = !!value;
	if (!isDisabled.value) {
		toggleRelatedElements();
	}
	if (state.writeEventEnabled) {
		const writeEvent = new Event('write');
		writeEvent.value = state.dataValue;
		el.dispatchEvent(writeEvent);
	}
};

const input = (value: boolean): void => {
	const el = root.value;
	if (!el) return;
	if (state.dataValue !== value) {
		write(value);
		if (state.inputEventEnabled) {
			const inputEvent = new Event('input', {
				bubbles: true
			});
			inputEvent.value = state.dataValue;
			el.dispatchEvent(inputEvent);
		}
		dispatchChangeEvent(el);
	}
};

const enable = (): void => {
	if (isDisabled.value) {
		isDisabled.value = false;
		toggleRelatedElements();
	}
};

const disable = (): void => {
	if (!isDisabled.value) {
		isDisabled.value = true;
		toggleRelatedElements();
	}
};

const relate = (elements: HTMLElement[]): void => {
	state.relations = elements;
};

const toggleRelatedElements = (): void => {
	if (!isDisabled.value && state.dataValue) {
		for (const element of state.relations) {
			if (typeof element.enable === 'function') {
				element.enable();
			} else {
				enableElement(element);
			}
		}
	} else {
		for (const element of state.relations) {
			if (typeof element.disable === 'function') {
				element.disable();
			} else {
				disableElement(element);
			}
		}
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
		case 'write':
			state.writeEventEnabled = true;
			break;
		case 'input':
			state.inputEventEnabled = true;
			break;
	}
};

defineExpose({ read, write, input, enable, disable, relate, on, root });

watch(() => props.modelValue, (val) => write(val));
watch(() => props.disabled, (val) => (val ? disable() : enable()));

onMounted(() => {
	const el = root.value as CheckBoxElement | null;
	if (!el) return;
	attachElementApi(el, { read, write, input, enable, disable, relate, on });
	Object.defineProperty(el, 'dataValue', {
		configurable: true,
		get: () => state.dataValue,
		set: (value: boolean) => {
			state.dataValue = !!value;
		}
	});
	Object.defineProperty(el, 'relations', {
		get: () => state.relations,
		set: (value: HTMLElement[]) => {
			state.relations = value;
		}
	});
	onElement(el, 'input', (e: Event & { value?: unknown }) => {
		emit('input', e.value);
		emit('update:modelValue', e.value);
	});
	onElement(el, 'write', (e: Event & { value?: unknown }) => emit('write', e.value));
	onElement(el, 'change', () => emit('change', read()));
	if (props.modelValue) write(true);
	if (props.disabled) disable();
});
</script>
