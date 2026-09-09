<template>
	<WindowFrame id="command-widget" no-buttons>
		<div class="text" id="command-searcher-mark">&gt;</div>
		<TextBox id="command-searcher" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TextBox from '@app/components/common/TextBox.vue';

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#command-widget {
	width: 400px;
	height: 20px;
	box-shadow: none;
	outline: none;
	/* outline-color: var(--input-border-color-focus); */
}
</style>

