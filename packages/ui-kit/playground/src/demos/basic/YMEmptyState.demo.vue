<script setup lang="ts">
import { ref } from 'vue';
import { YMEmptyState, YMButton } from '@ui-kit';
const mode = ref<'default' | 'custom'>('default');

const customIcon =
	'<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">' +
	'<path d="M12 3l7 4v10l-7 4-7-4V7z"/>' +
	'<path d="M12 8v5"/><circle cx="12" cy="16.5" r="0.5"/></svg>';
</script>

<template>
	<section>
		<h2>YMEmptyState</h2>
		<p class="desc">空状态占位；支持自定义 message 与 SVG 图标。</p>
		<div class="row">
			<YMButton size="sm" @click="mode = 'default'">Default</YMButton>
			<YMButton size="sm" @click="mode = 'custom'">Custom</YMButton>
		</div>
		<div class="stage">
			<YMEmptyState v-if="mode === 'default'" message="No data found" />
			<YMEmptyState v-else message="Drop files here to import assets" :icon="customIcon" />
		</div>
	</section>
</template>

<style scoped>
.stage {
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: var(--ym-space-3);
	width: 360px;
	height: 180px;
	background-color: var(--ym-color-surface-hover);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-md);
}
</style>
