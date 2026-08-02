<template>
<WindowFrame id="changeActorMotion">
	<TitleBar>Change Actor Motion<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text><CustomBox id="changeActorMotion-actor" type="actor" /><text>Type</text><SelectBox id="changeActorMotion-type" /><text>Motion</text
			><CustomBox id="changeActorMotion-motion" type="enum-string" /></grid-box>
		<button id="changeActorMotion-confirm" name="confirm">Confirm</button>
		<button id="changeActorMotion-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
