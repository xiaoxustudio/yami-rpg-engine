<template>
<window-frame id="stopActorAnimation">
	<title-bar>Stop Actor Animation<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="stopActorAnimation-actor" type="actor" /></grid-box>
		<button id="stopActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="stopActorAnimation-cancel" name="cancel">Cancel</button>
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
