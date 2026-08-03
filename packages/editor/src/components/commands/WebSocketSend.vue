<template>
	<WindowFrame id="webSocketSend">
		<TitleBar>webSocketSend<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">ID</div><StringVar id="webSocketSend-id" /> <div class="text">Data</div
				><StringVar id="webSocketSend-data" />
			</div>
			<button id="webSocketSend-confirm" name="confirm">Confirm</button>
			<button id="webSocketSend-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import StringVar from '@app/components/common/StringVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
