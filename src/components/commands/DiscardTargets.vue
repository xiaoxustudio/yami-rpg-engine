<template>
<window-frame id="discardTargets">
	<title-bar>Discard Targets<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="discardTargets-actor" type="actor" /><text>Selector</text><select-box id="discardTargets-selector" /><text>Distance</text
			><number-var
				id="discardTargets-distance"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /></grid-box>
		<button id="discardTargets-confirm" name="confirm">Confirm</button>
		<button id="discardTargets-cancel" name="cancel">Cancel</button>
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
