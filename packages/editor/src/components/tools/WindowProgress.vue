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
