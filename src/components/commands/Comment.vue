<template>
<window-frame id="comment">
	<title-bar>Comment<close /></title-bar>
	<content-frame>
		<text-area id="comment-comment" />
		<button id="comment-confirm" name="confirm">Confirm</button>
		<button id="comment-cancel" name="cancel">Cancel</button>
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
