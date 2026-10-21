<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import YMTextArea from '../YMTextArea/YMTextArea.vue';
import { elementDataOf } from '../../../utils/element-data';

interface Props {
	id?: string;
	modelValue?: unknown;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null as never,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	input: [value: unknown];
	change: [value: unknown];
}>();

const root = ref<HTMLElement | null>(null);
const areaRef = ref<InstanceType<typeof YMTextArea> | null>(null);

interface TextAreaVarApi extends HTMLElement {
	mode?: 'constant' | 'variable';
	read: () => unknown;
	write: (value: unknown) => void;
	switch: (target?: 'constant' | 'variable') => void;
	enable: () => void;
	disable: () => void;
	getFocus: (modeArg?: string) => HTMLElement | null | undefined;
	on: (
		type: string,
		listener: (event: Event) => void,
		options?: boolean | AddEventListenerOptions
	) => void;
}

const mode = ref<'constant' | 'variable'>('constant');
const textValue = ref('');
// oxlint-disable-next-line no-explicit-any
const varValue = ref<any>(null);

const displayValue = computed(() => {
	const value = varValue.value;
	return value && typeof value === 'object' ? value.key : value;
});

const read = (): unknown => {
	switch (mode.value) {
		case 'constant':
			return areaRef.value ? areaRef.value.read() : textValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: unknown): void => {
	switch (typeof value) {
		case 'string':
			switchMode('constant');
			textValue.value = value;
			areaRef.value?.write(value);
			break;
		case 'object':
			switchMode('variable');
			textValue.value = '';
			areaRef.value?.write('');
			varValue.value = value;
			break;
	}
};

const switchMode = (target?: 'constant' | 'variable'): void => {
	const el = root.value;
	const focus = !target && !!el && !el.classList.contains('disabled');
	if (target === undefined) {
		target = mode.value === 'constant' ? 'variable' : 'constant';
	}
	if (mode.value !== target) {
		if (el) {
			el.classList.remove(mode.value);
			el.classList.add(target);
			elementDataOf<TextAreaVarApi>(el).mode = target;
		}
		mode.value = target;
		if (target === 'constant') {
			nextTick(() => {
				const input = areaRef.value?.input;
				if (focus && input) {
					input.focus();
					input.select();
				}
			});
		}
		el?.dispatchEvent(new Event('change', { bubbles: true }));
	}
};

const enable = (): void => {
	const el = root.value;
	if (!el) return;
	if (el.classList.contains('disabled')) {
		el.classList.remove('disabled');
		el.dispatchEvent(new Event('change', { bubbles: true }));
	}
};

const disable = (): void => {
	const el = root.value;
	if (!el) return;
	if (!el.classList.contains('disabled')) {
		el.classList.add('disabled');
		el.dispatchEvent(new Event('change', { bubbles: true }));
	}
};

const getFocus = (modeArg?: string): HTMLElement | null | undefined => {
	switch (mode.value) {
		case 'constant': {
			const el = areaRef.value?.input;
			if (!el) return;
			setTimeout(() => {
				el.focus();
				switch (modeArg) {
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
			return el;
		}
		case 'variable':
			return root.value;
	}
};

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
};

const keydown = (event: KeyboardEvent): void => {
	switch (event.code) {
		case 'Slash':
			event.preventDefault();
			switchMode();
			break;
	}
};

const pointerdown = (event: PointerEvent): void => {
	const el = root.value;
	if (!el) return;
	switch (event.button) {
		case 0:
			if (!el.classList.contains('disabled') && event.target === el) {
				event.preventDefault();
				switchMode();
			}
			break;
		case 2:
			if (!el.classList.contains('disabled')) {
				event.preventDefault();
				switchMode();
			}
			break;
	}
};

const onTextInput = (value: string): void => {
	textValue.value = value;
	emit('update:modelValue', value);
	emit('input', value);
};

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, root });

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
	if (!el) return;
	el.tabIndex = 0;
	(el as TextAreaVarApi).read = read;
	(el as TextAreaVarApi).write = write;
	(el as TextAreaVarApi).switch = switchMode;
	(el as TextAreaVarApi).enable = enable;
	(el as TextAreaVarApi).disable = disable;
	(el as TextAreaVarApi).getFocus = getFocus;
	(el as TextAreaVarApi).on = on;
	elementDataOf<TextAreaVarApi>(el).mode = mode.value;
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
	if (props.disabled) disable();
});
</script>

<template>
	<div
		ref="root"
		class="text-area-var"
		:class="[mode, { disabled }]"
		:id="props.id"
		@keydown="keydown"
		@pointerdown="pointerdown"
	>
		<YMTextArea
			v-show="mode === 'constant'"
			ref="areaRef"
			:model-value="textValue"
			@update:model-value="onTextInput"
		/>
		<div v-show="mode !== 'constant'" class="text-area-var-variable">
			<slot name="variable" :value="varValue" />
			<div v-if="!$slots.variable" class="text-area-var-value">
				{{ displayValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(:where(.text-area-var-variable)) {
	width: 100%;
	min-width: 0;
}

:global(:where(.text-area-var)) {
	position: relative;
	display: block;
}

:global(:where(.text-area-var) > .text-area) {
	width: 100%;
	height: 100%;
}

:global(:where(.text-area-var)::before) {
	position: absolute;
	margin-left: -2em;
	font-family: var(--font-family-mono);
	color: var(--text-color-disabled);
}

:global(:where(.text-area-var.constant)::before) {
	content: 'str';
}

:global(:where(.text-area-var.variable)::before) {
	content: ' var';
}
</style>
