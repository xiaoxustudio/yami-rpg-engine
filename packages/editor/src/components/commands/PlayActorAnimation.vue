<template>
<WindowFrame id="playActorAnimation" @confirm="onConfirm">
	<template #title><TitleBar>Play Actor Animation<div class="close" /></TitleBar></template>
	
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
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from "@app/stores/inspector";
import { useLocalStore } from "@app/stores/local";
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.playActorAnimation?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
