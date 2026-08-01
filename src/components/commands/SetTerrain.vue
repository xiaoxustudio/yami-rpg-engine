<template>
	<window-frame id="setTerrain">
		<title-bar>Set Terrain<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Position</text><custom-box id="setTerrain-position" type="position" />
				<text>Terrain</text><select-box id="setTerrain-terrain" />
			</grid-box>
			<button id="setTerrain-confirm" name="confirm">Confirm</button>
			<button id="setTerrain-cancel" name="cancel">Cancel</button>
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
