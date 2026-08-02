<template>
<WindowFrame id="removeTarget">
	<TitleBar>Remove Target<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="removeTarget-actor" type="actor" /><text>Target</text><CustomBox id="removeTarget-target" type="actor" /></grid-box>
		<button id="removeTarget-confirm" name="confirm">Confirm</button>
		<button id="removeTarget-cancel" name="cancel">Cancel</button>
	</content-frame>
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
