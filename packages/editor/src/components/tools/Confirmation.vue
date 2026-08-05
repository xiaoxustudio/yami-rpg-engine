<template>
	<WindowFrame id="confirmation" no-buttons mode="center">
		<template #title><TitleBar>
			<div class="close" />
		</TitleBar></template>
		
			<div class="text" id="confirmation-message" />
			<div class="box" id="confirmation-button-frame">
				<button id="confirmation-button-0" />
				<button id="confirmation-button-1" />
				<button id="confirmation-button-2" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
