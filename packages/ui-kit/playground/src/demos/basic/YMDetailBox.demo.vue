<script setup lang="ts">
import { ref } from 'vue';
import { YMDetailBox, YMDetailSummary, YMButton } from '@ui-kit';
const open = ref(true);
const boxRef = ref<InstanceType<typeof YMDetailBox> | null>(null);
const lastToggle = ref('open');

const onToggle = (value: 'open' | 'closed'): void => {
	open.value = value === 'open';
	lastToggle.value = value;
};
</script>

<template>
	<section>
		<h2>YMDetailBox</h2>
		<p class="desc">折叠面板；点击标题栏或按钮切换展开/收起，内容区自动隐藏。</p>
		<div class="row">
			<YMButton size="sm" @click="boxRef?.toggle()">Toggle</YMButton>
			<YMButton size="sm" @click="boxRef?.open()">Open</YMButton>
			<YMButton size="sm" @click="boxRef?.close()">Close</YMButton>
			<span class="hint">toggle: {{ lastToggle }}</span>
		</div>
		<div class="stage">
			<YMDetailBox ref="boxRef" :open="open" @toggle="onToggle">
				<YMDetailSummary>Character Settings</YMDetailSummary>
				<div class="body">
					<div class="row">
						<span class="label">Name</span>
						<span class="value">Alice</span>
					</div>
					<div class="row">
						<span class="label">Level</span>
						<span class="value">12</span>
					</div>
					<div class="row">
						<span class="label">HP</span>
						<span class="value">86 / 120</span>
					</div>
				</div>
			</YMDetailBox>
		</div>
	</section>
</template>

<style scoped>
.stage {
	margin-top: var(--ym-space-3);
	width: 360px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
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
