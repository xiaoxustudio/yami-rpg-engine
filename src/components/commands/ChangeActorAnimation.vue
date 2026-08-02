<template>
<WindowFrame id="changeActorAnimation">
	<TitleBar>Change Actor Animation<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="changeActorAnimation-actor" type="actor" /><text>Animation</text
			><CustomBox
				id="changeActorAnimation-animationId"
				type="file"
				filter="animation"
			 /></grid-box>
		<button id="changeActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="changeActorAnimation-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
