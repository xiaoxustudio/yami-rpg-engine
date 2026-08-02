<template>
	<div class="loading-overlay" ref="root" :class="{ visible: count > 0 }">
		<div class="loading-spinner"></div>
		<div class="loading-text">{{ text }}</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const count = ref(0);
const text = ref('');
const root = ref<HTMLElement | null>(null);

const setText = (t: string): void => {
	text.value = t;
};

const show = (t?: string): void => {
	setText(t ?? '');
	count.value++;
};

const hide = (): void => {
	count.value = Math.max(0, count.value - 1);
};

defineExpose({ setText, show, hide, root });
</script>

<style scoped>
.loading-overlay {
	position: fixed;
	inset: 0;
	display: none;
	align-items: center;
	justify-content: center;
	flex-direction: column;
	gap: 16px;
	background: rgba(0, 0, 0, 0.45);
	z-index: 9999;
}

.loading-overlay.visible {
	display: flex;
}

.loading-overlay .loading-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(255, 255, 255, 0.25);
	border-top-color: #fff;
	border-radius: 50%;
	animation: loading-spin 0.8s linear infinite;
}

.loading-overlay .loading-text {
	color: #fff;
	font-size: 14px;
}

@keyframes loading-spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
