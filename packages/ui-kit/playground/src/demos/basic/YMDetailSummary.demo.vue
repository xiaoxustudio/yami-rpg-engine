<script setup lang="ts">
import { ref } from 'vue';
import { YMDetailBox, YMDetailSummary } from '@ui-kit';

const open = ref(false);
const count = ref(0);

const onToggle = (value: 'open' | 'closed'): void => {
	open.value = value === 'open';
	if (value === 'open') count.value++;
};
</script>

<template>
	<section>
		<h2>YMDetailSummary</h2>
		<p class="desc">面板标题行；需配合 YMDetailBox 使用，点击整行即可切换展开状态。</p>
		<div class="stage">
			<YMDetailBox :open="open" @toggle="onToggle">
				<YMDetailSummary>
					<span class="title">Inventory</span>
					<span class="badge">{{ count }} opens</span>
				</YMDetailSummary>
				<div class="body">
					<div class="row">
						<span class="label">Slot 1</span>
						<span class="value">Potion x5</span>
					</div>
					<div class="row">
						<span class="label">Slot 2</span>
						<span class="value">Key</span>
					</div>
					<div class="row">
						<span class="label">Slot 3</span>
						<span class="value">-</span>
					</div>
				</div>
			</YMDetailBox>
		</div>
		<p class="hint">state: {{ open ? 'open' : 'closed' }}</p>
	</section>
</template>

<style scoped>
.stage {
	margin-top: var(--ym-space-3);
	width: 360px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
}

.title {
	font-size: var(--ym-font-size-md);
}

.badge {
	margin-left: var(--ym-space-2);
	padding: 0 var(--ym-space-2);
	font-size: var(--ym-font-size-sm);
	background-color: var(--ym-color-selected);
	color: var(--ym-color-on-primary);
	border-radius: var(--ym-radius-sm);
}

.body {
	padding: var(--ym-space-2) var(--ym-space-3);
}

.label {
	width: 64px;
	color: var(--ym-color-text-unit);
	font-size: var(--ym-font-size-sm);
}

.value {
	font-size: var(--ym-font-size-sm);
}
</style>
