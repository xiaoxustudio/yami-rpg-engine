<template>
	<WindowFrame id="log" no-buttons>
		<template #title
			><TitleBar
				>Log
				<div class="close"></div></TitleBar
		></template>

		<CommonList id="log-list" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CommonList from '@app/components/common/CommonList.vue';

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/log.css 迁入组件（选择器为全局 id，不能用 scoped） */
#log-message {
	display: none;
	position: absolute;
	padding: 0 4px;
	left: 0;
	bottom: 0;
	height: auto;
	line-height: 16px;
	background-color: var(--log-message-background);
	/* pointer-events: none; */
	z-index: 10;
}
</style>

