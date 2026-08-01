<template>
<window-frame id="changeThreat">
	<title-bar>Change Threat<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeThreat-actor" type="actor" /><text>Target</text><custom-box id="changeThreat-target" type="actor" /><text>Operation</text><select-box id="changeThreat-operation" /><text>Threat</text
			><number-var
				id="changeThreat-threat"
				min="0"
				max="1000000000"
				decimals="4"
			 /></grid-box>
		<button id="changeThreat-confirm" name="confirm">Confirm</button>
		<button id="changeThreat-cancel" name="cancel">Cancel</button>
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
