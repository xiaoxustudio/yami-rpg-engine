<template>
<WindowFrame id="block">
	<TitleBar>Block<close /></TitleBar>
	<content-frame>
		<text-box id="block-note" />
		<check-box id="block-asynchronous" class="standard"
			><text id="block-asynchronous-label">Asynchronous</text></check-box
		>
		<button id="block-confirm" name="confirm">Confirm</button>
		<button id="block-cancel" name="cancel">Cancel</button>
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
