<template>
<window-frame id="createActor">
	<title-bar>Create Actor<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="createActor-actorId" type="file" filter="actor" /><text>Team</text><select-box id="createActor-teamId" /><text>Position</text
			><custom-box id="createActor-position" type="position" /><text>Angle</text
			><number-var
				id="createActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
			 /></grid-box>
		<button id="createActor-confirm" name="confirm">Confirm</button>
		<button id="createActor-cancel" name="cancel">Cancel</button>
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
