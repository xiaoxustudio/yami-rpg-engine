<template>
	<window-frame id="setCursor">
		<title-bar>Set Cursor<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Image</text
				><custom-box id="setCursor-image" type="file" filter="image" />
			</grid-box>
			<button id="setCursor-confirm" name="confirm">Confirm</button>
			<button id="setCursor-cancel" name="cancel">Cancel</button>
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
