<template>
<WindowFrame id="appendTarget">
	<TitleBar>Append Target<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="appendTarget-actor" type="actor" /><text>Target</text><custom-box id="appendTarget-target" type="actor" /></grid-box>
		<button id="appendTarget-confirm" name="confirm">Confirm</button>
		<button id="appendTarget-cancel" name="cancel">Cancel</button>
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
