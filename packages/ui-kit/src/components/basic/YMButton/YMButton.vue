<template>
	<button
		class="ym-button"
		:class="[
			'ym-button-' + variant,
			'ym-button-' + size,
			{ 'ym-button-disabled': disabled },
			$style.base,
			$style[variant],
			$style[size],
			{ [$style.disabled]: disabled }
		]"
		:disabled="disabled"
		:type="type"
		v-bind="$attrs"
		@click="onClick"
	>
		<slot />
	</button>
</template>

<script setup lang="ts">
interface Props {
	variant?: 'default' | 'primary' | 'danger';
	size?: 'sm' | 'md' | 'lg';
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
}

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<Props>(), {
	variant: 'default',
	size: 'md',
	type: 'button',
	disabled: false
});

const emit = defineEmits<{ click: [event: MouseEvent] }>();

const onClick = (event: MouseEvent) => {
	if (props.disabled) return;
	emit('click', event);
};
</script>

<style module>
.base {
	position: relative;
	width: auto;
	height: auto;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var(--ym-space-2);
	padding: 0 var(--ym-space-3);
	border: 1px solid var(--ym-color-input-border);
	border-radius: var(--ym-radius-sm);
	background: var(--ym-color-button-bg);
	color: var(--ym-color-text);
	font-family: var(--ym-font-sans);
	font-size: var(--ym-font-size-sm);
	line-height: 18px;
	cursor: pointer;
	user-select: none;
	transition:
		background-color 0.15s ease,
		border-color 0.15s ease,
		color 0.15s ease;
}

.base:hover:not(.disabled) {
	background: var(--ym-color-button-bg-hover);
}

.base:active:not(.disabled) {
	background: var(--ym-color-button-bg-active);
}

.primary {
	background: var(--ym-color-selected);
	border-color: var(--ym-color-selected);
	color: var(--ym-color-on-primary);
}

.primary:hover:not(.disabled) {
	background: var(--ym-color-primary-hover);
}

.danger {
	background: var(--ym-color-danger);
	border-color: var(--ym-color-danger);
	color: var(--ym-color-on-primary);
}

.danger:hover:not(.disabled) {
	background: var(--ym-color-danger-hover);
}

.sm {
	padding: 0 var(--ym-space-2);
	font-size: var(--ym-font-size-sm);
}

.lg {
	padding: 0 var(--ym-space-6);
	font-size: var(--ym-font-size-sm);
}

.disabled {
	pointer-events: none;
	color: var(--ym-color-text-disabled);
	background: var(--ym-color-button-bg-disabled);
}
</style>
