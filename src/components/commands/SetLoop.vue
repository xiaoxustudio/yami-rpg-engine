<template>
<window-frame id="setLoop">
	<title-bar>Set Loop<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Type</text><select-box id="setLoop-type" /> <text>Loop</text
			><select-box id="setLoop-loop" />
		</grid-box>
		<button id="setLoop-confirm" name="confirm">Confirm</button>
		<button id="setLoop-cancel" name="cancel">Cancel</button>
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
