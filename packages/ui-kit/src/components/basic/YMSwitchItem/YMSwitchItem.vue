<script setup lang="ts">
import { computed, ref, watch } from 'vue';

interface Props {
	modelValue?: number;
	length?: number;
	disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: 0,
	length: 1,
	disabled: false
});

const emit = defineEmits<{
	'update:modelValue': [value: number];
	change: [value: number];
}>();

const stateClasses = ['zero', 'one', 'two', 'three'];

const length = computed(() => Math.min(Math.max(Math.trunc(props.length), 1), 4));
const value = ref(props.modelValue % length.value);
const root = ref<HTMLElement | null>(null);

defineExpose({ root });

watch(
	() => props.modelValue,
	(val) => {
		value.value = val % length.value;
	}
);

const read = (): number => value.value;

const write = (val: number): void => {
	const next = val % length.value;
	if (next === value.value) return;
	value.value = next;
	emit('update:modelValue', next);
	emit('change', next);
};

const onPointerdown = (event: PointerEvent): void => {
	if (props.disabled || event.button !== 0) return;
	write(read() + 1);
};
</script>

<template>
	<div
		ref="root"
		class="switch-item"
		:class="[stateClasses[value], { disabled }]"
		:tabindex="disabled ? undefined : 0"
		@pointerdown="onPointerdown"
		@keydown="
			(event: KeyboardEvent) => {
				if (event.code === 'Enter' || event.code === 'NumpadEnter') {
					event.stopPropagation();
					write(read() + 1);
				}
			}
		"
	/>
</template>

<style module>
.switchItem {
	display: inline-block;
	width: 16px;
	height: 16px;
	border: 1px solid var(--ym-color-input-border);
	border-radius: var(--ym-radius-sm);
	background-color: var(--ym-color-input-bg);
	cursor: pointer;
	user-select: none;
}

.switchItem:global(:where(.zero)) {
	background-color: var(--ym-color-input-bg);
}

.switchItem:global(:where(.one)) {
	background-color: var(--ym-color-primary);
}

.switchItem:global(:where(.two)) {
	background-color: var(--ym-color-primary-hover);
}

.switchItem:global(:where(.three)) {
	background-color: var(--ym-color-danger);
}

.switchItem:global(:where(.disabled)) {
	pointer-events: none;
	opacity: 0.5;
}
</style>
