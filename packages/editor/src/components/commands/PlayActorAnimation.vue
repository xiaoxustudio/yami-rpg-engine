<template>
<WindowFrame id="playActorAnimation">
	<TitleBar>Play Actor Animation<div class="close" /></TitleBar>
	<div class="content-frame">
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="playActorAnimation-actor" type="actor" /><div class="text">Motion</div
			><CustomBox id="playActorAnimation-motion" type="enum-string" /><div class="text">Speed</div
			><NumberVar
				id="playActorAnimation-speed"
				min="0.1"
				max="10"
				step="0.1"
				decimals="4"
			 /><div class="text">Wait</div><SelectBox id="playActorAnimation-wait" name="wait" /></div>
		<button id="playActorAnimation-confirm" name="confirm">Confirm</button>
		<button id="playActorAnimation-cancel" name="cancel">Cancel</button>
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
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
