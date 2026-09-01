<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import YMSelectBox from '../YMSelectBox/YMSelectBox.vue';

interface Props {
	id?: string;
	modelValue?: unknown;
	items?: unknown[];
	disabled?: boolean;
	popup?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null as never,
	items: () => [],
	disabled: false,
	popup: true
});

const emit = defineEmits<{
	'update:modelValue': [value: unknown];
	input: [value: unknown];
	change: [value: unknown];
}>();

const root = ref<HTMLElement | null>(null);
const selectRef = ref<InstanceType<typeof YMSelectBox> | null>(null);

interface SelectVarApi extends HTMLElement {
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
// oxlint-disable-next-line no-explicit-any
const selectValue = ref<any>(null);
// oxlint-disable-next-line no-explicit-any
const varValue = ref<any>(null);

const displayValue = computed(() => {
	const value = varValue.value;
	return value && typeof value === 'object' ? value.key : value;
});

const read = (): unknown => {
	switch (mode.value) {
		case 'constant':
			return selectRef.value ? selectRef.value.read() : selectValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: unknown): void => {
	if (typeof value === 'object' && value !== null) {
		switchMode('variable');
		varValue.value = value;
	} else {
		switchMode('constant');
		selectValue.value = value;
		selectRef.value?.write(value);
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
			(el as SelectVarApi).mode = target;
		}
		mode.value = target;
		if (target === 'constant') {
			nextTick(() => {
				const boxRoot = selectRef.value?.root;
				if (focus && boxRoot) {
					boxRoot.focus();
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
		case 'constant':
			return selectRef.value ? selectRef.value.root : root.value;
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

const onSelectInput = (value: unknown): void => {
	selectValue.value = value;
	emit('update:modelValue', value);
	emit('input', value);
};

const loadItems = (items: unknown[]): void => {
	selectRef.value?.loadItems(items);
};

defineExpose({ read, write, switch: switchMode, enable, disable, getFocus, on, loadItems, root });

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
	(el as SelectVarApi).read = read;
	(el as SelectVarApi).write = write;
	(el as SelectVarApi).switch = switchMode;
	(el as SelectVarApi).enable = enable;
	(el as SelectVarApi).disable = disable;
	(el as SelectVarApi).getFocus = getFocus;
	(el as SelectVarApi).on = on;
	(el as SelectVarApi).mode = mode.value;
	el.addEventListener('keydown', keydown);
	el.addEventListener('pointerdown', pointerdown);
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
	if (props.disabled) disable();
});
</script>

<template>
	<div ref="root" class="select-var" :class="[mode, { disabled }]" :id="props.id">
		<YMSelectBox
			v-show="mode === 'constant'"
			ref="selectRef"
			:items="props.items"
			:model-value="selectValue"
			:popup="props.popup"
			@update:model-value="onSelectInput"
		/>
		<div v-show="mode !== 'constant'" class="select-var-variable">
			<slot name="variable" :value="varValue" />
			<div v-if="!$slots.variable" class="select-var-value">
				{{ displayValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(:where(.select-var-variable)) {
	width: 100%;
	min-width: 0;
}

:global(:where(.select-var)) {
	position: relative;
	display: block;
}

:global(:where(.select-var)::before) {
	position: absolute;
	font-family: var(--font-family-mono);
	color: var(--text-color-disabled);
}

:global(:where(.select-var.constant)::before) {
	content: 'enum';
	margin-left: -2.6em;
}

:global(:where(.select-var.variable)::before) {
	content: 'var';
	margin-left: -2em;
}
</style>
