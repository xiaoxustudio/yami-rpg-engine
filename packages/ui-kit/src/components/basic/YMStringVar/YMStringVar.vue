<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import YMTextBox from '../YMTextBox/YMTextBox.vue';
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
const strBoxRef = ref<InstanceType<typeof YMTextBox> | null>(null);

interface StringVarApi extends HTMLElement {
	mode?: 'constant' | 'variable';
	read: () => unknown;
	write: (value: unknown) => void;
	switch: (target?: 'constant' | 'variable') => void;
	enable: () => void;
	disable: () => void;
	getFocus: (modeArg?: string) => HTMLElement | null | undefined;
	on: (type: string, listener: (event: Event) => void, options?: boolean | AddEventListenerOptions) => void;
}

const mode = ref<'constant' | 'variable'>('constant');
const strValue = ref('');
// oxlint-disable-next-line no-explicit-any
const varValue = ref<any>(null);

const displayValue = computed(() => {
	const value = varValue.value;
	return value && typeof value === 'object' ? value.key : value;
});

const read = (): unknown => {
	switch (mode.value) {
		case 'constant':
			return strBoxRef.value ? strBoxRef.value.read() : strValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: unknown): void => {
	switch (typeof value) {
		case 'string':
			switchMode('constant');
			strValue.value = value;
			strBoxRef.value?.write(value);
			break;
		case 'object':
			switchMode('variable');
			strValue.value = '';
			strBoxRef.value?.write('');
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
			elementDataOf<StringVarApi>(el).mode = target;
		}
		mode.value = target;
		if (target === 'constant') {
			nextTick(() => {
				const input = strBoxRef.value?.input;
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
			const el = strBoxRef.value?.input;
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

const onStrInput = (value: string): void => {
	strValue.value = value;
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
	(el as StringVarApi).read = read;
	(el as StringVarApi).write = write;
	(el as StringVarApi).switch = switchMode;
	(el as StringVarApi).enable = enable;
	(el as StringVarApi).disable = disable;
	(el as StringVarApi).getFocus = getFocus;
	(el as StringVarApi).on = on;
	elementDataOf<StringVarApi>(el).mode = mode.value;
	el.addEventListener('keydown', keydown);
	el.addEventListener('pointerdown', pointerdown);
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
	if (props.disabled) disable();
});
</script>

<template>
	<div ref="root" class="string-var" :class="[mode, { disabled }]" :id="props.id">
		<YMTextBox
			v-show="mode === 'constant'"
			ref="strBoxRef"
			:model-value="strValue"
			@update:model-value="onStrInput"
		/>
		<div v-show="mode !== 'constant'" class="string-var-variable">
			<slot name="variable" :value="varValue" />
			<div v-if="!$slots.variable" class="string-var-value">
				{{ displayValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(:where(.string-var-variable)) {
	width: 100%;
	min-width: 0;
}

:global(:where(.string-var)) {
	position: relative;
	display: block;
}

:global(:where(.string-var) > .text-box) {
	width: 100%;
}

:global(:where(.string-var)::before) {
	position: absolute;
	margin-left: -2em;
	font-family: var(--font-family-mono);
	color: var(--text-color-disabled);
}

:global(:where(.string-var.constant)::before) {
	content: 'str';
}

:global(:where(.string-var.variable)::before) {
	content: ' var';
}
</style>
