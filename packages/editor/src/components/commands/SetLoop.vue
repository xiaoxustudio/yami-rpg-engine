<template>
<WindowFrame id="setLoop" @confirm="onConfirm">
	<template #title><TitleBar>Set Loop<div class="close" /></TitleBar></template>
	
		<div class="grid-box">
			<div class="text">Type</div><SelectBox id="setLoop-type" /> <div class="text">Loop</div
			><SelectBox id="setLoop-loop" />
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

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.setLoop?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
