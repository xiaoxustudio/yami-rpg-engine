<template>
<WindowFrame id="getMultipleActors">
	<TitleBar>Get Actor<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Write to List</text
			><custom-box
				id="getMultipleActors-variable"
				type="variable"
				filter="object"
			 /><text>Position</text
			><custom-box id="getMultipleActors-position" type="position" /><text>Area</text><select-box id="getMultipleActors-area" /><text>Width</text
			><number-var
				id="getMultipleActors-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><text>Height</text
			><number-var
				id="getMultipleActors-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			 /><text>Radius</text
			><number-var
				id="getMultipleActors-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><text>Selector</text><select-box id="getMultipleActors-selector" /><text>Team</text><select-var id="getMultipleActors-teamId" /><text>Activation</text><select-box id="getMultipleActors-activation" /></grid-box>
		<button id="getMultipleActors-confirm" name="confirm">Confirm</button>
		<button id="getMultipleActors-cancel" name="cancel">Cancel</button>
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
