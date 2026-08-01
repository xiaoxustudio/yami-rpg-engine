<template>
<window-frame id="followActor">
	<title-bar>Follow Actor<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="followActor-actor" type="actor" /><text>Target</text><custom-box id="followActor-target" type="actor" /><text>Mode</text><select-box id="followActor-mode" /><text>Min Distance</text
			><number-var
				id="followActor-minDist"
				min="0"
				max="16"
				decimals="4"
				unit="tile"
			 /><text>Max Distance</text
			><number-var
				id="followActor-maxDist"
				min="0"
				max="20"
				decimals="4"
				unit="tile"
			 /><text>Offset Ratio</text
			><number-box
				id="followActor-offset"
				min="-0.8"
				max="0.8"
				decimals="4"
				unit="r"
			 /><text>Vert Distance</text
			><number-box
				id="followActor-vertDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
			 /><text>Buffer Distance</text
			><number-box
				id="followActor-bufferDist"
				min="0"
				max="4"
				decimals="4"
				unit="tile"
			 /><text>Navigate</text><select-box id="followActor-navigate" /><text>Bypass Actors</text><select-box id="followActor-bypass" /><text>Once</text><select-box id="followActor-once" /><text>Wait</text
			><select-box id="followActor-wait" name="wait" /></grid-box>
		<button id="followActor-confirm" name="confirm">Confirm</button>
		<button id="followActor-cancel" name="cancel">Cancel</button>
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
