<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import YMSelectBox from '../YMSelectBox/YMSelectBox.vue';

interface Props {
	id?: string;
	modelValue?: any;
	items?: any[];
	disabled?: boolean;
	popup?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	items: () => [],
	disabled: false,
	popup: true
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	input: [value: any];
	change: [value: any];
}>();

const root = ref<HTMLElement | null>(null);
const selectRef = ref<InstanceType<typeof YMSelectBox> | null>(null);

const mode = ref<'constant' | 'variable'>('constant');
const selectValue = ref<any>(null);
const varValue = ref<any>(null);

const read = (): any => {
	switch (mode.value) {
		case 'constant':
			return selectRef.value ? selectRef.value.read() : selectValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: any): void => {
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
			(el as any).mode = target;
		}
		mode.value = target;
		if (target === 'constant') {
			nextTick(() => {
				const boxRoot = (selectRef.value as any)?.root as HTMLElement | null;
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

const getFocus = (modeArg: any): any => {
	switch (mode.value) {
		case 'constant':
			return selectRef.value ? selectRef.value.root : root.value;
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

const onSelectInput = (value: any): void => {
	selectValue.value = value;
	emit('input', value);
	emit('update:modelValue', value);
};

const loadItems = (items: any[]): void => {
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
				{{ varValue && typeof varValue === 'object' ? varValue.key : varValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(:where(.select-var)) {
	position: relative;
	display: block;
}
</style>
