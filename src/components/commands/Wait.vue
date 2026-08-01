<template>
<window-frame id="wait">
	<title-bar>Wait<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Duration</text
			><number-var id="wait-duration" min="1" max="3600000" unit="ms" />
		</grid-box>
		<button id="wait-confirm" name="confirm">Confirm</button>
		<button id="wait-cancel" name="cancel">Cancel</button>
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
