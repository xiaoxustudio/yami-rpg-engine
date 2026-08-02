<template>
<WindowFrame id="changeActorPortrait">
	<TitleBar>Change Actor Portrait<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorPortrait-actor" type="actor" /><text>Mode</text><select-box id="changeActorPortrait-mode" /><text>Portrait</text
			><custom-box id="changeActorPortrait-portrait" type="file" filter="image" /><text>Clip</text
			><custom-box
				id="changeActorPortrait-clip"
				type="clip"
				image="changeActorPortrait-portrait"
			 /></grid-box>
		<button id="changeActorPortrait-confirm" name="confirm">Confirm</button>
		<button id="changeActorPortrait-cancel" name="cancel">Cancel</button>
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
