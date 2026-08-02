<template>
<WindowFrame id="setAngle">
	<TitleBar>Set Angle<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setAngle-actor" type="actor" /><text>Angle</text><custom-box id="setAngle-angle" type="angle" /><text>Easing</text><select-box id="setAngle-easingId" name="easing" /><text>Duration</text
			><number-var
				id="setAngle-duration"
				name="duration"
				min="0"
				max="3600000"
				unit="ms"
			 /><text>Wait</text><select-box id="setAngle-wait" name="wait" /></grid-box>
		<button id="setAngle-confirm" name="confirm">Confirm</button>
		<button id="setAngle-cancel" name="cancel">Cancel</button>
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
