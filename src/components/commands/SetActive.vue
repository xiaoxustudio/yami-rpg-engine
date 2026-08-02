<template>
<WindowFrame id="setActive">
	<TitleBar>Set Active<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setActive-actor" type="actor" /><text>State</text><select-box id="setActive-active" /></grid-box>
		<button id="setActive-confirm" name="confirm">Confirm</button>
		<button id="setActive-cancel" name="cancel">Cancel</button>
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
