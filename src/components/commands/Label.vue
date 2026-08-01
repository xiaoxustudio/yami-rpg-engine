<template>
<window-frame id="label">
	<title-bar>Label<close /></title-bar>
	<content-frame>
		<grid-box> <text>Label Name</text><text-box id="label-name" /> </grid-box>
		<button id="label-confirm" name="confirm">Confirm</button>
		<button id="label-cancel" name="cancel">Cancel</button>
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
