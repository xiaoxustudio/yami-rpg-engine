<template>
<window-frame id="changeActorState">
	<title-bar>Change Actor State<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorState-actor" type="actor" /><text>Operation</text><select-box id="changeActorState-operation" /><text>State</text
			><custom-box id="changeActorState-stateId" type="file" filter="state" /><text>State</text><custom-box id="changeActorState-state" type="state" /></grid-box>
		<button id="changeActorState-confirm" name="confirm">Confirm</button>
		<button id="changeActorState-cancel" name="cancel">Cancel</button>
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
