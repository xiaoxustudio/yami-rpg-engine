<template>
<window-frame id="deleteGlobalActor">
	<title-bar>Delete Global Actor<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="deleteGlobalActor-actorId" type="file" filter="actor" /></grid-box>
		<button id="deleteGlobalActor-confirm" name="confirm">Confirm</button>
		<button id="deleteGlobalActor-cancel" name="cancel">Cancel</button>
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
