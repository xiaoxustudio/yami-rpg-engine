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
