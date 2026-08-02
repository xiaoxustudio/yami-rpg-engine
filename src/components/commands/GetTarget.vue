<template>
<WindowFrame id="getTarget">
	<TitleBar>Get Target<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><custom-box id="getTarget-actor" type="actor" /><text>Selector</text><select-box id="getTarget-selector" /><text>Condition</text><select-box id="getTarget-condition" /><text>Attribute</text><select-box id="getTarget-attribute" /><text>Attribute 2</text><select-box id="getTarget-divisor" /></grid-box>
		<button id="getTarget-confirm" name="confirm">Confirm</button>
		<button id="getTarget-cancel" name="cancel">Cancel</button>
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
