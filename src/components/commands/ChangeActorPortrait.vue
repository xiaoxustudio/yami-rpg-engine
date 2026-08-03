<template>
<WindowFrame id="changeActorPortrait">
	<TitleBar>Change Actor Portrait<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<text>Actor</text><CustomBox id="changeActorPortrait-actor" type="actor" /><text>Mode</text><SelectBox id="changeActorPortrait-mode" /><text>Portrait</text
			><CustomBox id="changeActorPortrait-portrait" type="file" filter="image" /><text>Clip</text
			><CustomBox
				id="changeActorPortrait-clip"
				type="clip"
				image="changeActorPortrait-portrait"
			 /></div>
		<button id="changeActorPortrait-confirm" name="confirm">Confirm</button>
		<button id="changeActorPortrait-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
