<template>
	<window-frame id="continueGame">
		<title-bar>Continue Game<close /></title-bar>
		<content-frame>
			<button id="continueGame-confirm" name="confirm">Confirm</button>
			<button id="continueGame-cancel" name="cancel">Cancel</button>
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
