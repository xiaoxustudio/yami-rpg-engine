<template>
<window-frame id="renderOutline">
	<title-bar>Render Outline<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Operation</text><select-box id="renderOutline-operation" /><text>Actor</text><custom-box id="renderOutline-actor" type="actor" /><text>Color</text><color-box id="renderOutline-color" /></grid-box>
		<button id="renderOutline-confirm" name="confirm">Confirm</button>
		<button id="renderOutline-cancel" name="cancel">Cancel</button>
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
