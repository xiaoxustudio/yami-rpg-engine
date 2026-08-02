<template>
<WindowFrame id="playActorAnimation">
	<TitleBar>Play Actor Animation<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="playActorAnimation-actor" type="actor" /><text>Motion</text
			><custom-box id="playActorAnimation-motion" type="enum-string" /><text>Speed</text
			><number-var
				id="playActorAnimation-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			 /><text>Wait</text><select-box id="playActorAnimation-wait" name="wait" /></grid-box>
		<button id="playActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="playActorAnimation-cancel" name="cancel">Cancel</button>
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
