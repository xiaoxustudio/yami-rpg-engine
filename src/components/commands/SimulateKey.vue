<template>
	<window-frame id="simulateKey">
		<title-bar>Simulate Key<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Operation</text><select-box id="simulateKey-operation" />
				<text>Key Code</text><keyboard-box id="simulateKey-keycode" />
			</grid-box>
			<button id="simulateKey-confirm" name="confirm">Confirm</button>
			<button id="simulateKey-cancel" name="cancel">Cancel</button>
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
