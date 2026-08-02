<template>
	<WindowFrame id="webSocketSend">
		<TitleBar>webSocketSend<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>ID</text><string-var id="webSocketSend-id" /> <text>Data</text
				><string-var id="webSocketSend-data" />
			</grid-box>
			<button id="webSocketSend-confirm" name="confirm">Confirm</button>
			<button id="webSocketSend-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
