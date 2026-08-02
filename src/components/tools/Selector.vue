<template>
		<WindowFrame id="selector" mode="center">
		<TitleBar
			>Select File<div class="maximize"></div>
			<div class="close"></div>
		</TitleBar>
		<content-frame>
			<div class="file-browser" id="selector-browser">
				<FileBrowser />
			</div>
			<button id="selector-confirm" name="confirm">Confirm</button>
			<button id="selector-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
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
