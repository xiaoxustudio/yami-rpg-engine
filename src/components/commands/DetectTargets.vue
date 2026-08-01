<template>
<window-frame id="detectTargets">
	<title-bar>Detect Targets<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="detectTargets-actor" type="actor" /><text>Distance</text
			><number-var
				id="detectTargets-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><text>Selector</text><select-box id="detectTargets-selector" /><text>In Sight</text><select-box id="detectTargets-inSight" /></grid-box>
		<button id="detectTargets-confirm" name="confirm">Confirm</button>
		<button id="detectTargets-cancel" name="cancel">Cancel</button>
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
