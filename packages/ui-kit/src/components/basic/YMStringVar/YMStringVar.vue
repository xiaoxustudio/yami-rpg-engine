<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue';
import YMTextBox from '../YMTextBox/YMTextBox.vue';

interface Props {
	id?: string;
	modelValue?: any;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: null,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: any];
	input: [value: any];
	change: [value: any];
}>();

const root = ref<HTMLElement | null>(null);
const strBoxRef = ref<InstanceType<typeof YMTextBox> | null>(null);

const mode = ref<'constant' | 'variable'>('constant');
const strValue = ref('');
const varValue = ref<any>(null);

const read = (): any => {
	switch (mode.value) {
		case 'constant':
			return strBoxRef.value ? strBoxRef.value.read() : strValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: any): void => {
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
			(el as any).mode = target;
		}
		mode.value = target;
		if (target === 'constant') {
			nextTick(() => {
				const input = (strBoxRef.value as any)?.input;
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
			const el = (strBoxRef.value as any)?.input;
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

const onStrInput = (value: string): void => {
	strValue.value = value;
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
				{{ varValue && typeof varValue === 'object' ? varValue.key : varValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(:where(.string-var)) {
	position: relative;
	display: block;
}
</style>
