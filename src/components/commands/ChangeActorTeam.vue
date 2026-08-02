<template>
<WindowFrame id="changeActorTeam">
	<TitleBar>Change Actor Team<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorTeam-actor" type="actor" /><text>Team</text><select-box id="changeActorTeam-teamId" /></grid-box>
		<button id="changeActorTeam-confirm" name="confirm">Confirm</button>
		<button id="changeActorTeam-cancel" name="cancel">Cancel</button>
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
