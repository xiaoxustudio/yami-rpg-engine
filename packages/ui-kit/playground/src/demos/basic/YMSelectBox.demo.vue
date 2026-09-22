<script setup lang="ts">
import { ref } from 'vue';
import { YMSelectBox } from '@ui-kit';

interface DemoItem {
	value: string;
	name: string;
	tip?: string;
}

const items: DemoItem[] = [
	{ value: 'fire', name: '火焰', tip: '红莲业火' },
	{ value: 'water', name: '水流', tip: '碧波万顷' },
	{ value: 'earth', name: '大地' },
	{ value: 'wind', name: '狂风' }
];

const selected = ref('fire');
const fixed = ref('water');
const openCount = ref(0);
const lastChange = ref<unknown>(null);

const onChange = (value: unknown) => {
	lastChange.value = value;
};

const onOpen = () => {
	openCount.value++;
};
</script>

<template>
	<section class="demo">
		<h2>YMSelectBox</h2>
		<div class="row">
			<div class="box">
				<YMSelectBox v-model="selected" :items="items" @change="onChange" />
			</div>
			<span class="hint">内置弹层 (popup 默认 true): {{ selected }}</span>
		</div>
		<div class="row">
			<div class="box">
				<YMSelectBox
					v-model="selected"
					:items="items"
					:popup="false"
					@open="onOpen"
					@change="onChange"
				/>
			</div>
			<span class="hint"
				>popup=false: 点击/回车触发 open ({{ openCount }}), 方向键可切换选项</span
			>
		</div>
		<div class="row">
			<div class="box">
				<YMSelectBox v-model="fixed" :items="items" disabled />
			</div>
			<span class="hint">disabled: {{ fixed }}</span>
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
	width: 180px;
}

.hint {
	margin: 0;
	font-size: var(--ym-font-size-sm);
	color: var(--ym-color-text-unit);
}
</style>
