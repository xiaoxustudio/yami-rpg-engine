<template>
<window-frame id="changePassableTerrain">
	<title-bar>Change Passable Terrain<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="changePassableTerrain-actor" type="actor" /><text>Passable Terrain</text
			><select-box id="changePassableTerrain-passage" /></grid-box>
		<button id="changePassableTerrain-confirm" name="confirm">Confirm</button>
		<button id="changePassableTerrain-cancel" name="cancel">Cancel</button>
	</content-frame>
</window-frame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
