<template>
<WindowFrame id="moveActor">
	<TitleBar>Move Actor<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="moveActor-actor" type="actor" /><text>Mode</text><select-box id="moveActor-mode" /><text>Angle</text
			><number-var
				id="moveActor-angle"
				min="-360"
				max="360"
				decimals="4"
				unit="deg"
			 /><text>Destination</text
			><custom-box id="moveActor-destination" type="position" /><text>Wait</text
			><select-box id="moveActor-wait" name="wait" /></grid-box>
		<button id="moveActor-confirm" name="confirm">Confirm</button>
		<button id="moveActor-cancel" name="cancel">Cancel</button>
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
