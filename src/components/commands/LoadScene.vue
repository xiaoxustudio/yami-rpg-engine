<template>
	<window-frame id="loadScene">
		<title-bar>Load Scene<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Scene</text
				><file-var id="loadScene-sceneId" type="file" filter="scene" />
				<text>Transfer Player</text><select-box id="loadScene-transfer" />
				<text>X</text
				><number-var id="loadScene-x" min="0" max="512" step="0.5" decimals="4" />
				<text>Y</text
				><number-var id="loadScene-y" min="0" max="512" step="0.5" decimals="4" />
			</grid-box>
			<button id="loadScene-confirm" name="confirm">Confirm</button>
			<button id="loadScene-cancel" name="cancel">Cancel</button>
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
