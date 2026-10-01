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

/** 循环步进：`write` 自己会取模，这里只保证 step(-1) 不会传进负数 */
const step = (delta: number): void => {
	write((read() + delta + length.value) % length.value);
};

/**
 * 这个控件的真实用法是 `:length="3"` 的多态循环（AutoTile 的邻接位），
 * 不是布尔开关 —— 所以对外按 `spinbutton` 暴露当前值，而不是 `switch` + `aria-checked`
 * （后者只有开/关两态，会谎报状态）。相应地补上 spinbutton 约定的方向键。
 */
const onKeydown = (event: KeyboardEvent): void => {
	if (props.disabled) return;
	switch (event.code) {
		case 'Enter':
		case 'NumpadEnter':
			event.stopPropagation();
			step(1);
			break;
		case 'Space':
			// 空格是激活键的通用约定；必须拦默认滚动
			event.preventDefault();
			event.stopPropagation();
			step(1);
			break;
		case 'ArrowUp':
		case 'ArrowRight':
			event.preventDefault();
			event.stopPropagation();
			step(1);
			break;
		case 'ArrowDown':
		case 'ArrowLeft':
			event.preventDefault();
			event.stopPropagation();
			step(-1);
			break;
	}
};
</script>

<template>
	<div
		ref="root"
		class="switch-item"
		:class="[$style.switchItem, stateClasses[value], { disabled }]"
		role="spinbutton"
		:aria-valuenow="value"
		aria-valuemin="0"
		:aria-valuemax="length - 1"
		:aria-disabled="disabled || undefined"
		:tabindex="disabled ? undefined : 0"
		@pointerdown="onPointerdown"
		@keydown="onKeydown"
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
	background-color: var(--ym-color-selected);
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
