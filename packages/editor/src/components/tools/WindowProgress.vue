<template>
	<!-- 进度窗口 -->
	<WindowFrame id="windowProgress" no-buttons>
		<template #title><TitleBar>进度</TitleBar></template>

		<div class="flex-box" id="windowProgress-flex">
			<div
				class="text"
				id="windowProgress-info"
				:ref="registryRef(titleEls, 'windowProgress-info')"
			/>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { titleEls } from '@app/title/element-registry';
import { registryRef } from '@app/utils/element-registry';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';

onMounted(() => {});
</script>

<style>
/* 不能用 scoped：选择器需命中子组件内部生成的元素 */
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
