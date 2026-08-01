<template>
<window-frame id="removeTarget">
	<title-bar>Remove Target<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="removeTarget-actor" type="actor" /><text>Target</text><custom-box id="removeTarget-target" type="actor" /></grid-box>
		<button id="removeTarget-confirm" name="confirm">Confirm</button>
		<button id="removeTarget-cancel" name="cancel">Cancel</button>
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
