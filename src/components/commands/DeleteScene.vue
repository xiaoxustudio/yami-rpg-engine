<template>
	<window-frame id="deleteScene">
		<title-bar>Delete Scene<close /></title-bar>
		<content-frame>
			<button id="deleteScene-confirm" name="confirm">Confirm</button>
			<button id="deleteScene-cancel" name="cancel">Cancel</button>
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
