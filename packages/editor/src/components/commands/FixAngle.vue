<template>
<WindowFrame id="fixAngle" @confirm="onConfirm">
	<template #title><TitleBar>Fix Angle<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Actor</div><CustomBox id="fixAngle-actor" type="actor" /><div class="text">State</div><SelectBox id="fixAngle-fixed" /></div>
	
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.fixAngle?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
