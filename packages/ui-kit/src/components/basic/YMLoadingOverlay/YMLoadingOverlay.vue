<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
	visible?: boolean;
	text?: string;
}

const props = withDefaults(defineProps<Props>(), {
	visible: false,
	text: ''
});

const root = ref<HTMLElement | null>(null);
const showCount = ref(props.visible ? 1 : 0);

defineExpose({ root, show: () => showCount.value++, hide: () => (showCount.value = Math.max(0, showCount.value - 1)) });

watch(
	() => props.visible,
	(val) => {
		if (val) showCount.value++;
		else showCount.value = 0;
	}
);
</script>

<template>
	<div
		ref="root"
		class="loading-overlay"
		:class="[$style.overlay, { visible: showCount > 0 }]"
	>
		<div class="loading-spinner" :class="$style.spinner" />
		<div class="loading-text" :class="$style.text">{{ text }}</div>
	</div>
</template>

<style module>
.overlay {
	position: fixed;
	inset: 0;
	display: none;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: var(--ym-space-4);
	background: var(--ym-color-overlay);
	z-index: 9999;
}

.overlay:global(.visible) {
	display: flex;
}

.spinner {
	width: 40px;
	height: 40px;
	border: 4px solid color-mix(in srgb, var(--ym-color-text-inverse) 25%, transparent);
	border-top-color: var(--ym-color-text-inverse);
	border-radius: 50%;
	animation: ym-loading-spin 0.8s linear infinite;
}

.text {
	color: var(--ym-color-text-inverse);
	font-size: var(--ym-font-size-md);
}

@keyframes ym-loading-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
