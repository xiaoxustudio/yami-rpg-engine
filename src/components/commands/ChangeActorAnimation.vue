<template>
<WindowFrame id="changeActorAnimation">
	<TitleBar>Change Actor Animation<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorAnimation-actor" type="actor" /><div class="text">Animation</div
			><CustomBox
				id="changeActorAnimation-animationId"
				type="file"
				filter="animation"
			 /></div>
		<button id="changeActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="changeActorAnimation-cancel" name="cancel">Cancel</button>
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
