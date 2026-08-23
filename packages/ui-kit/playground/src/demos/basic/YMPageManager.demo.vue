<script setup lang="ts">
import { ref } from 'vue';
import { YMPageManager, YMButton } from '@ui-kit';
const pageRef = ref<InstanceType<typeof YMPageManager> | null>(null);
const current = ref('(none)');

const go = (value: string): void => {
	pageRef.value?.switch(value);
};

const onSwitch = (last: unknown, value: unknown): void => {
	current.value = String(value);
};
</script>

<template>
	<section>
		<h2>YMPageManager</h2>
		<p class="desc">页面管理器；通过 switch() 切换 .page-frame 页面，切换时派发 switch 事件。</p>
		<div class="row">
			<YMButton size="sm" :variant="current === 'overview' ? 'primary' : 'default'" @click="go('overview')">Overview</YMButton>
			<YMButton size="sm" :variant="current === 'events' ? 'primary' : 'default'" @click="go('events')">Events</YMButton>
			<YMButton size="sm" :variant="current === 'variables' ? 'primary' : 'default'" @click="go('variables')">Variables</YMButton>
			<span class="hint">current: {{ current }}</span>
		</div>
		<div class="stage">
			<YMPageManager ref="pageRef" @switch="onSwitch">
				<div class="page-frame" value="overview">
					<div class="frame-body">Overview page: 地图大小 32x24，玩家出生点 (4, 4)。</div>
				</div>
				<div class="page-frame" value="events">
					<div class="frame-body">Events page: 当前地图共 12 个事件。</div>
				</div>
				<div class="page-frame" value="variables">
					<div class="frame-body">Variables page: 32 个局部变量、8 个全局变量。</div>
				</div>
			</YMPageManager>
		</div>
	</section>
</template>

<style scoped>
.stage {
	position: relative;
	margin-top: var(--ym-space-3);
	width: 360px;
	height: 140px;
	background-color: var(--ym-color-input-bg);
	border: 1px solid var(--ym-color-border);
}

.frame-body {
	padding: var(--ym-space-3);
	font-size: var(--ym-font-size-sm);
	line-height: 1.6;
}
</style>
