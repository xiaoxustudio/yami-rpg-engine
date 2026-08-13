<template>
	<WindowFrame id="webSocketSend" @confirm="onConfirm">
		<template #title><TitleBar>webSocketSend<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">ID</div><StringVar id="webSocketSend-id" /> <div class="text">Data</div
				><StringVar id="webSocketSend-data" />
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
import StringVar from '@app/components/common/StringVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onConfirm = () => {
	Command?.cases?.webSocketSend?.save?.();
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
