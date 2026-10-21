<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { attachApi } from '../../../utils/attach-api';
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

const mode = ref<'constant' | 'variable'>('constant');
const fileValue = ref('');
const varValue = ref<{ key?: string } | null>(null);

const displayValue = computed(() => {
	const value = varValue.value;
	return value && typeof value === 'object' ? value.key : value;
});

const read = (): string | { key?: string } | null => {
	switch (mode.value) {
		case 'constant':
			return fileValue.value;
		case 'variable':
			return varValue.value;
	}
};

const write = (value: unknown): void => {
	switch (typeof value) {
		case 'string':
			switchMode('constant');
			fileValue.value = value;
			break;
		case 'object':
			switchMode('variable');
			fileValue.value = '';
			varValue.value = value as { key?: string } | null;
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
			elementDataOf<{ mode?: 'constant' | 'variable' }>(el).mode = target;
		}
		mode.value = target;
		if (focus) {
			nextTick(() => {
				if (target === 'constant') {
					const fileSlot = el?.querySelector('.file-var-file') as HTMLElement | null;
					if (fileSlot) fileSlot.focus();
				} else {
					const varSlot = el?.querySelector('.file-var-variable') as HTMLElement | null;
					if (varSlot) varSlot.focus();
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

const getFocus = (_modeArg?: unknown): HTMLElement | null | undefined => {
	switch (mode.value) {
		case 'constant': {
			const fileSlot = root.value?.querySelector('.file-var-file') as HTMLElement | null;
			if (fileSlot) {
				fileSlot.focus();
				return fileSlot;
			}
			return root.value;
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

const onFileInput = (value: string): void => {
	fileValue.value = value;
	emit('update:modelValue', value);
	emit('input', value);
};

const onVarInput = (value: unknown): void => {
	varValue.value = value as { key?: string } | null;
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
	attachApi(el as HTMLElement & Record<string, unknown>, {
		read,
		write,
		switch: switchMode,
		enable,
		disable,
		getFocus,
		on
	});
	elementDataOf<{ mode?: 'constant' | 'variable' }>(el).mode = mode.value;
	if (props.modelValue !== null && props.modelValue !== undefined) {
		write(props.modelValue);
	}
	if (props.disabled) disable();
});
</script>

<template>
	<div
		ref="root"
		class="file-var"
		:class="[mode, { disabled }]"
		:id="props.id"
		@keydown="keydown"
		@pointerdown="pointerdown"
	>
		<div v-show="mode === 'constant'" class="file-var-file">
			<slot name="file" :value="fileValue" :on-input="onFileInput" />
		</div>
		<div v-show="mode !== 'constant'" class="file-var-variable">
			<slot name="variable" :value="varValue" :on-input="onVarInput" />
			<div v-if="!$slots.variable" class="file-var-value">
				{{ displayValue }}
			</div>
		</div>
	</div>
</template>

<style module>
:global(:where(.file-var-variable)) {
	width: 100%;
	min-width: 0;
}

:global(:where(.file-var)) {
	position: relative;
	display: block;
}

:global(:where(.file-var)::before) {
	position: absolute;
	font-family: var(--font-family-mono);
	color: var(--text-color-disabled);
}

:global(:where(.file-var.constant)::before) {
	content: 'file';
	margin-left: -2.6em;
}

:global(:where(.file-var.variable)::before) {
	content: 'var';
	margin-left: -2em;
}
</style>
