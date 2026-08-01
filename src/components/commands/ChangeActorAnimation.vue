<template>
<window-frame id="changeActorAnimation">
	<title-bar>Change Actor Animation<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorAnimation-actor" type="actor" /><text>Animation</text
			><custom-box
				id="changeActorAnimation-animationId"
				type="file"
				filter="animation"
			 /></grid-box>
		<button id="changeActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="changeActorAnimation-cancel" name="cancel">Cancel</button>
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
