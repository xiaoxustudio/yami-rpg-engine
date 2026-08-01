<template>
<window-frame id="setActive">
	<title-bar>Set Active<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setActive-actor" type="actor" /><text>State</text><select-box id="setActive-active" /></grid-box>
		<button id="setActive-confirm" name="confirm">Confirm</button>
		<button id="setActive-cancel" name="cancel">Cancel</button>
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
