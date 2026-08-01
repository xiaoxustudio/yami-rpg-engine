<template>
<window-frame id="fixAngle">
	<title-bar>Fix Angle<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="fixAngle-actor" type="actor" /><text>State</text><select-box id="fixAngle-fixed" /></grid-box>
		<button id="fixAngle-confirm" name="confirm">Confirm</button>
		<button id="fixAngle-cancel" name="cancel">Cancel</button>
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
