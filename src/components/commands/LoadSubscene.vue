<template>
	<window-frame id="loadSubscene">
		<title-bar>Load Subscene<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Scene</text
				><file-var id="loadSubscene-sceneId" type="file" filter="scene" />
				<text>Shift X</text><number-var id="loadSubscene-shiftX" min="0" max="512" />
				<text>Shift Y</text><number-var id="loadSubscene-shiftY" min="0" max="512" />
			</grid-box>
			<button id="loadSubscene-confirm" name="confirm">Confirm</button>
			<button id="loadSubscene-cancel" name="cancel">Cancel</button>
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
