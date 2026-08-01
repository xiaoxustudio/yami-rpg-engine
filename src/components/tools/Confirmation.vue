<template>
	<window-frame id="confirmation" mode="center">
		<title-bar>
			<close />
		</title-bar>
		<content-frame>
			<text id="confirmation-message" />
			<box id="confirmation-button-frame">
				<button id="confirmation-button-0" />
				<button id="confirmation-button-1" />
				<button id="confirmation-button-2" />
			</box>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
