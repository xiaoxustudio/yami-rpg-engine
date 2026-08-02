<template>
<WindowFrame id="changeActorState">
	<TitleBar>Change Actor State<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorState-actor" type="actor" /><text>Operation</text><select-box id="changeActorState-operation" /><text>State</text
			><custom-box id="changeActorState-stateId" type="file" filter="state" /><text>State</text><custom-box id="changeActorState-state" type="state" /></grid-box>
		<button id="changeActorState-confirm" name="confirm">Confirm</button>
		<button id="changeActorState-cancel" name="cancel">Cancel</button>
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
