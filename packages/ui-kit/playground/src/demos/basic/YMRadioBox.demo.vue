<script setup lang="ts">
import { ref } from 'vue';
import { YMRadioBox } from '@ui-kit';

const group = 'demo-radio-group';
const options = ['red', 'green', 'blue'] as const;
const selected = ref<string | number | boolean>('red');
const lastChange = ref<string | number | boolean>('');

const onSelect = (value: string | number | boolean) => {
	selected.value = value;
	lastChange.value = value;
};
</script>

<template>
	<section class="demo">
		<h2>YMRadioBox</h2>
		<div class="row">
			<YMRadioBox
				v-for="item in options"
				:key="item"
				:name="group"
				:value="item"
				:selected="selected === item"
				@select="onSelect"
			>
				{{ item }}
			</YMRadioBox>
		</div>
		<div class="row">
			<YMRadioBox
				v-for="item in options"
				:key="'standard-' + item"
				:name="group + '-standard'"
				:value="item"
				standard
				:selected="selected === item"
				@select="onSelect"
			>
				{{ item }}
			</YMRadioBox>
		</div>
		<div class="row">
			<YMRadioBox name="demo-radio-disabled" value="a" disabled>Disabled</YMRadioBox>
		</div>
		<p class="hint">selected: {{ selected }} | lastChange: {{ lastChange }}</p>
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
