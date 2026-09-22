<script setup lang="ts">
import { ref } from 'vue';
import { YMCheckBox } from '@ui-kit';

const normal = ref(true);
const standard = ref(true);
const large = ref(false);
const fixedDisabled = ref(true);
const lastChange = ref<boolean | null>(null);

const onChange = (value: boolean) => {
	lastChange.value = value;
};
</script>

<template>
	<section class="demo">
		<h2>YMCheckBox</h2>
		<div class="row">
			<YMCheckBox v-model="normal" @change="onChange">Normal {{ normal }}</YMCheckBox>
			<YMCheckBox v-model="standard" standard @change="onChange">Standard</YMCheckBox>
			<YMCheckBox v-model="large" standard large @change="onChange"
				>Standard Large</YMCheckBox
			>
		</div>
		<div class="row">
			<YMCheckBox v-model="fixedDisabled" disabled>Disabled (checked)</YMCheckBox>
			<YMCheckBox :model-value="false" disabled>Disabled</YMCheckBox>
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
	gap: var(--ym-space-4);
	flex-wrap: wrap;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
