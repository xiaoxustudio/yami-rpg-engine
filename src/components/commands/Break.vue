<template>
<window-frame id="break">
	<title-bar>Break<close /></title-bar>
	<content-frame>
		<button id="break-confirm" name="confirm">Confirm</button>
		<button id="break-cancel" name="cancel">Cancel</button>
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
