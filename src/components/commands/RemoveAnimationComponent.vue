<template>
<window-frame id="removeAnimationComponent">
	<title-bar>Remove Animation Component<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="removeAnimationComponent-actor" type="actor" /><text>Animation</text
			><custom-box
				id="removeAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><text>Motion</text><select-box id="removeAnimationComponent-motion" /></grid-box>
		<button id="removeAnimationComponent-confirm" name="confirm">Confirm</button>
		<button id="removeAnimationComponent-cancel" name="cancel">Cancel</button>
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
