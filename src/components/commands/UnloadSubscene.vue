<template>
	<window-frame id="unloadSubscene">
		<title-bar>Unload Subscene<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Scene</text
				><file-var id="unloadSubscene-sceneId" type="file" filter="scene" />
			</grid-box>
			<button id="unloadSubscene-confirm" name="confirm">Confirm</button>
			<button id="unloadSubscene-cancel" name="cancel">Cancel</button>
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
