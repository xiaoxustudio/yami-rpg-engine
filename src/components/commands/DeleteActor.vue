<template>
<WindowFrame id="deleteActor">
	<TitleBar>Delete Actor<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="deleteActor-actor" type="actor" /></div>
		<button id="deleteActor-confirm" name="confirm">Confirm</button>
		<button id="deleteActor-cancel" name="cancel">Cancel</button>
	</div>
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
