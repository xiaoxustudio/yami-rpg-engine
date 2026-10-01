<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
	modelValue?: boolean;
	disabled?: boolean;
	standard?: boolean;
	large?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	modelValue: false,
	disabled: false,
	standard: false,
	large: false
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
	change: [value: boolean];
}>();

const value = ref(props.modelValue);
const root = ref<HTMLElement | null>(null);

defineExpose({ root });

watch(
	() => props.modelValue,
	(val) => {
		value.value = !!val;
	}
);

const toggle = (): void => {
	if (props.disabled) return;
	value.value = !value.value;
	emit('update:modelValue', value.value);
	emit('change', value.value);
};

const onPointerdown = (event: PointerEvent): void => {
	if (props.disabled || event.button !== 0) return;
	if (document.activeElement !== document.body) {
		(document.activeElement as HTMLElement | null)?.blur?.();
	}
	toggle();
};

const onKeydown = (event: KeyboardEvent): void => {
	if (props.disabled) return;
	if (event.code === 'Enter' || event.code === 'NumpadEnter') {
		event.stopPropagation();
		toggle();
		return;
	}
	if (event.code === 'Space') {
		// 空格是 checkbox 的标准激活键（读屏会按 role=checkbox 提示它）；必须拦默认滚动
		event.preventDefault();
		event.stopPropagation();
		toggle();
	}
};
</script>

<template>
	<div
		ref="root"
		class="check-box"
		:class="[$style.checkBox, { selected: value, standard, large, disabled }]"
		role="checkbox"
		:aria-checked="value"
		:aria-disabled="disabled || undefined"
		:tabindex="standard && !disabled ? 0 : undefined"
		@pointerdown="onPointerdown"
		@keydown="onKeydown"
	>
		<span v-if="standard" class="check-mark" :class="$style.checkMark" />
		<slot />
	</div>
</template>

<style module>
:global(:where(.check-box)) {
	display: inline-block;
	white-space: nowrap;
	cursor: pointer;
	user-select: none;
}

:global(:where(.check-box.standard)) {
	display: block;
	padding: 2px 0;
	line-height: 16px;
}

:global(:where(.check-box.standard:focus > .check-mark)) {
	border-color: var(--ym-color-input-border-focus);
}

:global(:where(.check-mark)) {
	display: inline-block;
	position: relative;
	vertical-align: top;
	margin-right: 4px;
	width: 16px;
	height: 16px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-input-border);
	border-radius: var(--ym-radius-sm);
}

:global(.check-mark::before) {
	content: '\2713';
	position: absolute;
	left: 0;
	top: 0;
	width: 16px;
	height: 16px;
	font-size: 1.2em;
	font-weight: bold;
	font-family: var(--ym-font-sans);
	text-align: center;
	line-height: 16px;
	color: var(--ym-check-mark-color);
	opacity: 0;
}

:global(.check-box.selected > .check-mark::before) {
	opacity: 1;
}

:global(.check-box.selected:active > .check-mark::before) {
	opacity: 0.5;
}

:global(:where(.check-box.standard.large)) {
	padding: 0;
	line-height: 20px;
}

:global(:where(.check-box.standard.large > .check-mark)) {
	width: 20px;
	height: 20px;
}

:global(.check-box.standard.large > .check-mark::before) {
	width: 20px;
	height: 20px;
	line-height: 20px;
	font-size: 1.5em;
}

:global(:where(.check-box.disabled)) {
	pointer-events: none;
	opacity: 0.5;
}
</style>
