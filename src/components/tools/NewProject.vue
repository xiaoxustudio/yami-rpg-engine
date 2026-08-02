<template>
		<WindowFrame id="newProject">
		<TitleBar>New Project<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Template</text><select-box id="newProject-template" />
				<text>Folder</text><text-box id="newProject-folder" />
				<text>Location</text>
				<flex-box id="newProject-location-box">
					<text-box id="newProject-location" />
					<button id="newProject-choose">…</button>
				</flex-box>
			</grid-box>
			<text id="newProject-warning" />
			<button id="newProject-confirm" name="confirm">Confirm</button>
			<button id="newProject-cancel" name="cancel">Cancel</button>
		</content-frame>
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
