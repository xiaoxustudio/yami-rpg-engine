<template>
<WindowFrame id="comment">
	<TitleBar>Comment<close /></TitleBar>
	<content-frame>
		<text-area id="comment-comment" />
		<button id="comment-confirm" name="confirm">Confirm</button>
		<button id="comment-cancel" name="cancel">Cancel</button>
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
