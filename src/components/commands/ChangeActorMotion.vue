<template>
<window-frame id="changeActorMotion">
	<title-bar>Change Actor Motion<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorMotion-actor" type="actor" /><text>Type</text><select-box id="changeActorMotion-type" /><text>Motion</text
			><custom-box id="changeActorMotion-motion" type="enum-string" /></grid-box>
		<button id="changeActorMotion-confirm" name="confirm">Confirm</button>
		<button id="changeActorMotion-cancel" name="cancel">Cancel</button>
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
