<template>
	<!-- 进度窗口 -->
	<WindowFrame id="windowProgress" no-buttons>
		<template #title><TitleBar>进度</TitleBar></template>

		<div class="flex-box" id="windowProgress-flex">
			<div class="text" id="windowProgress-info" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/dialogs.css 迁入组件（选择器为全局 id，不能用 scoped） */
#windowProgress {
	width: 380px;
	height: 116px;
}

#windowProgress-flex {
	margin: 10px;
	flex-direction: column;
}

#windowProgress-box {
	display: block;
	height: 20px;
	background-color: var(--input-background);
	border: var(--input-border);
	border-radius: 2px;
	overflow: hidden;
}

#windowProgress-bar {
	display: block;
	width: 100%;
	height: 100%;
	background-color: var(--selected-background);
}
</style>

