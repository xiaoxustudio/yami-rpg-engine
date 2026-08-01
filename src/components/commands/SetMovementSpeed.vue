<template>
<window-frame id="setMovementSpeed">
	<title-bar>Set Movement Speed<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setMovementSpeed-actor" type="actor" /><text>Property</text><select-box id="setMovementSpeed-property" /><text>Base Speed</text
			><number-var
				id="setMovementSpeed-base"
				min="0"
				max="32"
				decimals="4"
				unit="t/s"
			 /><text>Speed Factor</text
			><number-var id="setMovementSpeed-factor" min="0" max="4" decimals="4" /></grid-box>
		<button id="setMovementSpeed-confirm" name="confirm">Confirm</button>
		<button id="setMovementSpeed-cancel" name="cancel">Cancel</button>
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
