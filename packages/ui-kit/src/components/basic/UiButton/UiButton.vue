<template>
	<button
		class="ui-button"
		:class="[$style.base, $style[variant], $style[size], { [$style.disabled]: disabled }]"
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
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: var(--ui-space-2);
	padding: var(--ui-space-2) var(--ui-space-4);
	border: 1px solid var(--ui-color-border);
	border-radius: var(--ui-radius-sm);
	background: var(--ui-color-surface);
	color: var(--ui-color-text);
	font-family: var(--ui-font-sans);
	font-size: var(--ui-font-size-md);
	line-height: 1.4;
	cursor: pointer;
	user-select: none;
	transition:
		background-color 0.15s ease,
		border-color 0.15s ease,
		color 0.15s ease;
}

.base:hover:not(.disabled) {
	background: var(--ui-color-surface-hover);
}

.primary {
	background: var(--ui-color-primary);
	border-color: var(--ui-color-primary);
	color: var(--ui-color-on-primary);
}

.primary:hover:not(.disabled) {
	background: var(--ui-color-primary-hover);
}

.danger {
	background: var(--ui-color-danger);
	border-color: var(--ui-color-danger);
	color: var(--ui-color-on-primary);
}

.danger:hover:not(.disabled) {
	background: var(--ui-color-danger-hover);
}

.sm {
	padding: var(--ui-space-1) var(--ui-space-2);
	font-size: var(--ui-font-size-sm);
}

.lg {
	padding: var(--ui-space-3) var(--ui-space-6);
	font-size: var(--ui-font-size-lg);
}

.disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
</style>
