<script setup lang="ts">
import { ref } from 'vue';
import { YMColorBox } from '@ui-kit';

const color = ref('2080d0ff');
const lastInput = ref('');

const onInput = (value: string) => {
	lastInput.value = value;
};
</script>

<template>
	<section class="demo">
		<h2>YMColorBox</h2>
		<div class="row">
			<div class="box">
				<YMColorBox v-model="color" @input="onInput" />
			</div>
			<span class="hint">点击弹出取色器, 当前: {{ color }}</span>
		</div>
		<div class="row">
			<div class="box">
				<YMColorBox :model-value="'d9534fff'" disabled />
			</div>
			<span class="hint">disabled: d9534fff</span>
		</div>
		<p class="hint">最近 input: {{ lastInput }}</p>
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

.box {
	width: 120px;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
