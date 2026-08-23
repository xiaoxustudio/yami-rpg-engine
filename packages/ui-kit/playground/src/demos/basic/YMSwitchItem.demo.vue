<script setup lang="ts">
import { ref } from 'vue';
import { YMSwitchItem } from '@ui-kit';

const state4 = ref(1);
const state2 = ref(0);
const state3 = ref(2);
const lastChange = ref(-1);

const onChange = (value: number) => {
	lastChange.value = value;
};
</script>

<template>
	<section class="demo">
		<h2>YMSwitchItem</h2>
		<div class="row">
			<YMSwitchItem v-model="state4" :length="4" @change="onChange" />
			<span class="hint">length=4, value: {{ state4 }}</span>
		</div>
		<div class="row">
			<YMSwitchItem v-model="state2" :length="2" @change="onChange" />
			<span class="hint">length=2 (on/off), value: {{ state2 }}</span>
		</div>
		<div class="row">
			<YMSwitchItem v-model="state3" :length="3" @change="onChange" />
			<span class="hint">length=3, value: {{ state3 }}</span>
		</div>
		<div class="row">
			<YMSwitchItem v-model="state4" :length="4" disabled />
			<span class="hint">disabled</span>
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

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
