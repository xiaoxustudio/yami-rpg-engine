<template>
<WindowFrame id="setPlayerActor">
	<TitleBar>Set Player Actor<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Global Actor</text
			><custom-box id="setPlayerActor-actor" type="actor" /></grid-box>
		<button id="setPlayerActor-confirm" name="confirm">Confirm</button>
		<button id="setPlayerActor-cancel" name="cancel">Cancel</button>
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
