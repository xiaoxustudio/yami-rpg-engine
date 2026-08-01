<template>
		<window-frame id="setKey">
		<title-bar>Set Key<close></close></title-bar>
		<content-frame>
			<grid-box> <text>Key</text><text-box id="setKey-key" /> </grid-box>
			<button id="setKey-confirm" name="confirm">Confirm</button>
			<button id="setKey-cancel" name="cancel">Cancel</button>
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
