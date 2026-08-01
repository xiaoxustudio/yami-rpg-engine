<template>
<window-frame id="setAnimationComponent">
	<title-bar>Set Animation Component<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><custom-box id="setAnimationComponent-actor" type="actor" /><text>Animation</text
			><custom-box
				id="setAnimationComponent-animationId"
				type="file"
				filter="animation"
			 /><text>Motion</text><select-box id="setAnimationComponent-motion" /><text>Operation</text><select-box id="setAnimationComponent-operation" /><text>Angle</text
			><custom-box id="setAnimationComponent-angle" type="angle" /><text>Scale</text
			><number-var
				id="setAnimationComponent-scale"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
			 /><text>Speed</text
			><number-var
				id="setAnimationComponent-speed"
				min="0"
				max="10"
				step="0.1"
				decimals="4"
			 /><text>Opacity</text
			><number-var
				id="setAnimationComponent-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			 /><text>Priority</text
			><number-box id="setAnimationComponent-priority" min="-100" max="100" /><text>Offset Y</text
			><number-box
				id="setAnimationComponent-offsetY"
				min="-100"
				max="100"
				unit="px"
			 /><text>Sprite Name</text><select-box id="setAnimationComponent-spriteId" /><text>Image</text
			><custom-box id="setAnimationComponent-image" type="file" filter="image" /><text>Play Motion</text><select-box id="setAnimationComponent-playMotion" /><text>Wait</text><select-box id="setAnimationComponent-wait" name="wait" /></grid-box>
		<button id="setAnimationComponent-confirm" name="confirm">Confirm</button>
		<button id="setAnimationComponent-cancel" name="cancel">Cancel</button>
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
