<template>
	<window-frame id="preventSceneInput">
		<title-bar>Prevent Scene Input<close /></title-bar>
		<content-frame>
			<button id="preventSceneInput-confirm" name="confirm">Confirm</button>
			<button id="preventSceneInput-cancel" name="cancel">Cancel</button>
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
