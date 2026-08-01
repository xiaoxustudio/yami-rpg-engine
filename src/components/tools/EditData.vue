<template>
	<window-frame id="edit-data">
		<title-bar
			>edit data<text id="edit-data-mark" class="hidden">✱</text>
			<maximize id="edit-data-maximize" />
			<close />
		</title-bar>
		<content-frame>
			<box id="edit-data-current"> </box>
			<button id="edit-data-confirm" name="confirm">Confirm</button>
			<button id="edit-data-cancel" name="cancel">Cancel</button>
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
