<template>
<WindowFrame id="loop" @confirm="onConfirm">
	<template #title><TitleBar>Loop<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Mode</div><SelectBox id="loop-mode" /> <div class="text">Conditions</div
			><ParamList id="loop-conditions" />
		</div>
	
</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Command } from '@/command/command-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import SelectBox from '@app/components/common/SelectBox.vue';
import ParamList from '@app/components/common/ParamList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.loop?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
