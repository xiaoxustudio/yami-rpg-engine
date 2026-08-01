<template>
<window-frame id="getActor">
	<title-bar>Get Actor<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Write to Variable</text
			><custom-box id="getActor-variable" type="variable" filter="object" /><text>Position</text><custom-box id="getActor-position" type="position" /><text>Area</text><select-box id="getActor-area" /><text>Size</text
			><number-var id="getActor-size" min="0" max="512" decimals="4" unit="tile" /><text>Radius</text
			><number-var
				id="getActor-radius"
				min="0"
				max="256"
				decimals="4"
				unit="tile"
			 /><text>Selector</text><select-box id="getActor-selector" /><text>Team</text
			><select-var id="getActor-teamId" /><text>Condition</text
			><select-box id="getActor-condition" /><text>Attribute</text
			><select-box id="getActor-attribute" /><text>Attribute 2</text
			><select-box id="getActor-divisor" /><text>Activation</text
			><select-box id="getActor-activation" /><text>Exclusion</text
			><select-box id="getActor-exclusion" /><text>Exclusion Actor</text
			><custom-box id="getActor-exclusionActor" type="actor" /><text>Exclusion Team</text><select-var id="getActor-exclusionTeamId" /></grid-box>
		<button id="getActor-confirm" name="confirm">Confirm</button>
		<button id="getActor-cancel" name="cancel">Cancel</button>
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
