<template>
<window-frame id="jumpTo">
	<title-bar>Jump to<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Operation</text><select-box id="jumpTo-operation" />
			<text>Label Name</text><text-box id="jumpTo-label" />
		</grid-box>
		<button id="jumpTo-confirm" name="confirm">Confirm</button>
		<button id="jumpTo-cancel" name="cancel">Cancel</button>
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
