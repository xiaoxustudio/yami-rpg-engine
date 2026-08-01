<template>
<window-frame id="independent">
	<title-bar>Independent<close /></title-bar>
	<content-frame>
		<button id="independent-confirm" name="confirm">Confirm</button>
		<button id="independent-cancel" name="cancel">Cancel</button>
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
