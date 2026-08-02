<template>
<WindowFrame id="createGlobalActor">
	<TitleBar>Create Global Actor<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="createGlobalActor-actorId" type="file" filter="actor" /><text>Team</text><select-box id="createGlobalActor-teamId" /></grid-box>
		<button id="createGlobalActor-confirm" name="confirm">Confirm</button>
		<button id="createGlobalActor-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
