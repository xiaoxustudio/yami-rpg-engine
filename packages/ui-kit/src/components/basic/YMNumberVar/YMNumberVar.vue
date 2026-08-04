<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import YMNumberBox from '../YMNumberBox/YMNumberBox.vue';

interface Props {
	id?: string;
	min?: number | string;
	max?: number | string;
	step?: number | string;
	decimals?: number | string;
	unit?: string;
	modelValue?: any;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	min: '0',
	max: '0',
	step: '1',
	decimals: 0,
	unit: '',
	modelValue: null,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	input: [value: any];
	change: [value: any];
}>();

const root = ref<HTMLElement | null>(null);
const numBoxRef = ref<InstanceType<typeof YMNumberBox> | null>(null);

const mode = ref<'constant' | 'variable'>('constant');
const numValue = ref(0);
const varValue = ref<any>(null);
const pluginInput = ref(false);

const read = (): any => {
	switch (mode.value) {
		case 'constant':
			return numBoxRef.value ? numBoxRef.value.read() : numValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: any): void => {
	switch (typeof value) {
		case 'number': {
			switchMode('constant');
			numValue.value = value;
			numBoxRef.value?.write(value);
			break;
		}
		case 'string': {
			const n = Number(value);
			if (!Number.isNaN(n)) {
				switchMode('constant');
				numValue.value = n;
				numBoxRef.value?.write(n);
			}
			break;
		}
		case 'object':
			switchMode('variable');
			numValue.value = 0;
			numBoxRef.value?.write(0);
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
			(el as any).mode = target;
		}
		mode.value = target;
		if (target === 'constant') {
			nextTick(() => {
				const input = (numBoxRef.value as any)?.input;
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

const getFocus = (modeArg: any): any => {
	switch (mode.value) {
		case 'constant': {
			const el = (numBoxRef.value as any)?.input;
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
	listener: (event: any) => void,
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

const onNumInput = (value: number): void => {
	numValue.value = value;
	emit('input', value);
	emit('update:modelValue', value);
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
	(el as any).read = read;
	(el as any).write = write;
	(el as any).switch = switchMode;
	(el as any).enable = enable;
	(el as any).disable = disable;
	(el as any).getFocus = getFocus;
	(el as any).on = on;
	(el as any).mode = mode.value;
	el.addEventListener('keydown', keydown);
	el.addEventListener('pointerdown', pointerdown);
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
	if (props.disabled) disable();
});
</script>

<template>
	<div
		ref="root"
		class="number-var"
		:class="[mode, { disabled }]"
		:id="props.id"
	>
		<YMNumberBox
			v-show="mode === 'constant'"
			ref="numBoxRef"
			:min="props.min"
			:max="props.max"
			:step="props.step"
			:decimals="props.decimals"
			:unit="props.unit"
			:model-value="numValue"
			@update:model-value="onNumInput"
		/>
		<div v-show="mode !== 'constant'" class="number-var-variable">
			<slot name="variable" :value="varValue" />
			<div v-if="!$slots.variable" class="number-var-value">
				{{ varValue && typeof varValue === 'object' ? varValue.key : varValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(.number-var) {
	position: relative;
	display: block;
}
</style>
