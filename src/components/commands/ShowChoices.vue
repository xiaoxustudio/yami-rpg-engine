<template>
<window-frame id="showChoices">
	<title-bar>Show Choices<close /></title-bar>
	<content-frame>
		<grid-box>
			<text>Choices</text><param-list id="showChoices-choices" />
			<text>Parameters</text><text-box id="showChoices-parameters" />
		</grid-box>
		<button id="showChoices-confirm" name="confirm">Confirm</button>
		<button id="showChoices-cancel" name="cancel">Cancel</button>
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
