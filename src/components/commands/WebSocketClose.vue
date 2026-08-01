<template>
	<window-frame id="webSocketClose">
		<title-bar>webSocketClose<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>ID</text><string-var id="webSocketClose-id" /> <text>Code</text
				><number-box id="webSocketClose-code" min="1000" max="4999" />
				<text>Reason</text><string-var id="webSocketClose-reason" />
			</grid-box>
			<button id="webSocketClose-confirm" name="confirm">Confirm</button>
			<button id="webSocketClose-cancel" name="cancel">Cancel</button>
		</content-frame>
	</window-frame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
