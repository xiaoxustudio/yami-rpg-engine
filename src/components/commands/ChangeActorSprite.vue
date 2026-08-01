<template>
<window-frame id="changeActorSprite">
	<title-bar>Change Actor Sprite<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="changeActorSprite-actor" type="actor" /><text>Animation</text
			><custom-box
				id="changeActorSprite-animationId"
				type="file"
				filter="animation"
			 /><text>Sprite Name</text><select-box id="changeActorSprite-spriteId" /><text>Sprite</text
			><custom-box id="changeActorSprite-image" type="file" filter="image" /></grid-box>
		<button id="changeActorSprite-confirm" name="confirm">Confirm</button>
		<button id="changeActorSprite-cancel" name="cancel">Cancel</button>
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
