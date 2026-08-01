<template>
<window-frame id="setPartyMember">
	<title-bar>Set Party Member<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Operation</text><select-box id="setPartyMember-operation" /><text>Global Actor</text
			><custom-box id="setPartyMember-actor" type="actor" /></grid-box>
		<button id="setPartyMember-confirm" name="confirm">Confirm</button>
		<button id="setPartyMember-cancel" name="cancel">Cancel</button>
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
