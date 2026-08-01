<template>
<window-frame id="continue">
	<title-bar>Continue<close /></title-bar>
	<content-frame>
		<button id="continue-confirm" name="confirm">Confirm</button>
		<button id="continue-cancel" name="cancel">Cancel</button>
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
