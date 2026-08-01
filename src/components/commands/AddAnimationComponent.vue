<template>
<window-frame id="addAnimationComponent">
	<title-bar>Add Animation Component<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="addAnimationComponent-actor" type="actor" /><text>Animation</text
			><custom-box
				id="addAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><text>Motion</text><select-box id="addAnimationComponent-motion" /><text>Rotatable</text><select-box id="addAnimationComponent-rotatable" /><text>Sync Angle</text><select-box id="addAnimationComponent-syncAngle" /><text>Priority</text
			><number-box id="addAnimationComponent-priority" min="-100" max="100" /><text>Offset Y</text
			><number-box
				id="addAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
			 /></grid-box>
		<button id="addAnimationComponent-confirm" name="confirm">Confirm</button>
		<button id="addAnimationComponent-cancel" name="cancel">Cancel</button>
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
