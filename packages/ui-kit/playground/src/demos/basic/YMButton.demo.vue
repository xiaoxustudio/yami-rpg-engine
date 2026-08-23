<script setup lang="ts">
import { ref } from 'vue';
import { YMButton } from '@ui-kit';

const count = ref(0);
const lastVariant = ref('');

const onClick = (variant: string) => {
	count.value++;
	lastVariant.value = variant;
};
</script>

<template>
	<section class="demo">
		<h2>YMButton</h2>
		<div class="row">
			<YMButton variant="default" @click="onClick('default')">Default</YMButton>
			<YMButton variant="primary" @click="onClick('primary')">Primary</YMButton>
			<YMButton variant="danger" @click="onClick('danger')">Danger</YMButton>
		</div>
		<div class="row">
			<YMButton size="sm" @click="onClick('sm')">Small</YMButton>
			<YMButton size="md" @click="onClick('md')">Medium</YMButton>
			<YMButton size="lg" @click="onClick('lg')">Large</YMButton>
		</div>
		<div class="row">
			<YMButton disabled>Disabled</YMButton>
			<YMButton variant="primary" :disabled="count % 2 === 0">Toggle Disabled</YMButton>
		</div>
		<p class="hint">click 次数: {{ count }} | 最近 variant: {{ lastVariant || '-' }}</p>
	</section>
</template>

<style scoped>
.demo {
	display: flex;
	flex-direction: column;
	gap: var(--ym-space-3);
	padding: var(--ym-space-4);
	background: var(--ym-color-surface);
	border: 1px solid var(--ym-color-border);
	border-radius: var(--ym-radius-md);
}

.row {
	display: flex;
	align-items: center;
	gap: var(--ym-space-2);
	flex-wrap: wrap;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
