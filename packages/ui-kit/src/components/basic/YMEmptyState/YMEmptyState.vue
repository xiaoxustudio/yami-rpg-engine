<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
	message?: string;
	icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
	message: '',
	icon: ''
});

const root = ref<HTMLElement | null>(null);

defineExpose({ root });

const defaultIcon =
	'<svg viewBox="0 0 24 24" width="48" height="48" ' +
	'fill="none" stroke="currentColor" stroke-width="1.5">' +
	'<rect x="3" y="4" width="18" height="16" rx="2"/>' +
	'<path d="M3 9h18"/></svg>';

const iconHtml = computed(() => {
	if (!props.icon) return defaultIcon;
	const d = document.createElement('div');
	d.textContent = props.icon;
	return d.innerHTML;
});
</script>

<template>
	<div ref="root" class="empty-state" :class="$style.emptyState">
		<div class="empty-icon" :class="$style.icon" v-html="iconHtml" />
		<div class="empty-text" :class="$style.text">{{ message }}</div>
	</div>
</template>

<style module>
.emptyState {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: var(--ym-space-3);
	padding: var(--ym-space-6) var(--ym-space-4);
	color: var(--ym-color-text-unit);
	text-align: center;
	user-select: none;
}

.icon {
	color: var(--ym-color-text-unit);
	opacity: 0.8;
}

.text {
	font-size: var(--ym-font-size-md);
	line-height: 1.5;
	max-width: 280px;
}
</style>
