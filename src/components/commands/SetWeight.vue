<template>
<WindowFrame id="setWeight">
	<TitleBar>Set Weight<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="setWeight-actor" type="actor" /><text>Weight</text
			><number-var id="setWeight-weight" min="0" max="8" step="0.1" decimals="4" /></grid-box>
		<button id="setWeight-confirm" name="confirm">Confirm</button>
		<button id="setWeight-cancel" name="cancel">Cancel</button>
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
