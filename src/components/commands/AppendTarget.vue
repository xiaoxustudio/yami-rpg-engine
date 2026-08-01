<template>
<window-frame id="appendTarget">
	<title-bar>Append Target<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="appendTarget-actor" type="actor" /><text>Target</text><custom-box id="appendTarget-target" type="actor" /></grid-box>
		<button id="appendTarget-confirm" name="confirm">Confirm</button>
		<button id="appendTarget-cancel" name="cancel">Cancel</button>
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
