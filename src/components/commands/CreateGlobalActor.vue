<template>
<WindowFrame id="createGlobalActor">
	<TitleBar>Create Global Actor<div class="close" /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Actor</text
			><CustomBox id="createGlobalActor-actorId" type="file" filter="actor" /><text>Team</text><SelectBox id="createGlobalActor-teamId" /></grid-box>
		<button id="createGlobalActor-confirm" name="confirm">Confirm</button>
		<button id="createGlobalActor-cancel" name="cancel">Cancel</button>
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
