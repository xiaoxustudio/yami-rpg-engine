<script setup lang="ts">
import { ref } from 'vue';
import { YMNumberBox } from '@ui-kit';

const value = ref(50);
const percent = ref(3);
const ratio = ref(0.5);
const fixed = ref(10);
const lastChange = ref(0);

const onChange = (value: number) => {
	lastChange.value = value;
};
</script>

<template>
	<section class="demo">
		<h2>YMNumberBox</h2>
		<div class="row">
			<div class="box">
				<YMNumberBox v-model="value" :min="0" :max="100" :step="1" @change="onChange" />
			</div>
			<span class="hint">min 0 / max 100 / step 1: {{ value }}</span>
		</div>
		<div class="row">
			<div class="box">
				<YMNumberBox
					v-model="percent"
					:min="0"
					:max="10"
					:step="1"
					unit="%"
					@change="onChange"
				/>
			</div>
			<span class="hint">unit="%": {{ percent }}</span>
		</div>
		<div class="row">
			<div class="box">
				<YMNumberBox
					v-model="ratio"
					:min="0"
					:max="1"
					:step="0.1"
					:decimals="2"
					@change="onChange"
				/>
			</div>
			<span class="hint">step 0.1 / decimals 2: {{ ratio }}</span>
		</div>
		<div class="row">
			<div class="box">
				<YMNumberBox v-model="fixed" :min="0" :max="100" disabled>
					<span class="label">HP</span>
				</YMNumberBox>
			</div>
			<span class="hint">disabled + label 槽位: {{ fixed }}</span>
		</div>
		<p class="hint">最近 change: {{ lastChange }}</p>
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
	width: 160px;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
