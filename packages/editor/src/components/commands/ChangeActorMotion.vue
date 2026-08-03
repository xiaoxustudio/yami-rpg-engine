<template>
<WindowFrame id="changeActorMotion">
	<TitleBar>Change Actor Motion<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="changeActorMotion-actor" type="actor" /><div class="text">Type</div><SelectBox id="changeActorMotion-type" /><div class="text">Motion</div
			><CustomBox id="changeActorMotion-motion" type="enum-string" /></div>
		<button id="changeActorMotion-confirm" name="confirm">Confirm</button>
		<button id="changeActorMotion-cancel" name="cancel">Cancel</button>
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
