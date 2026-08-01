<template>
		<window-frame id="selector" mode="center">
		<title-bar
			>Select File<maximize></maximize>
			<close></close>
		</title-bar>
		<content-frame>
			<file-browser id="selector-browser">
				<FileBrowser />
			</file-browser>
			<button id="selector-confirm" name="confirm">Confirm</button>
			<button id="selector-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import FileBrowser from '../file-browser/FileBrowser.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
