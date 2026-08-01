<template>
<window-frame id="restoreAudio">
	<title-bar>Restore Audio<close /></title-bar>
	<content-frame>
		<grid-box> <text>Type</text><select-box id="restoreAudio-type" /> </grid-box>
		<button id="restoreAudio-confirm" name="confirm">Confirm</button>
		<button id="restoreAudio-cancel" name="cancel">Cancel</button>
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
