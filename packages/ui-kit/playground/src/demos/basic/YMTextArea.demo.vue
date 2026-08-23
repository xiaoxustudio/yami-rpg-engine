<script setup lang="ts">
import { ref } from 'vue';
import { YMTextArea } from '@ui-kit';

const text = ref('第一行\n第二行\n第三行');
const disabledText = ref('只读内容');
</script>

<template>
	<section class="demo">
		<h2>YMTextArea</h2>
		<div class="row">
			<div class="area">
				<YMTextArea v-model="text" />
			</div>
			<div class="area">
				<YMTextArea v-model="disabledText" disabled />
			</div>
		</div>
		<p class="hint">字符数: {{ text.length }} | disabled 字数: {{ disabledText.length }}</p>
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
	gap: var(--ym-space-3);
	flex-wrap: wrap;
}

.area {
	width: 260px;
	height: 120px;
}

.area :deep(.text-area) {
	width: 100%;
	height: 100%;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
