<template>
<WindowFrame id="showChoices">
	<TitleBar>Show Choices<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Choices</text><param-list id="showChoices-choices" />
			<text>Parameters</text><text-box id="showChoices-parameters" />
		</grid-box>
		<button id="showChoices-confirm" name="confirm">Confirm</button>
		<button id="showChoices-cancel" name="cancel">Cancel</button>
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
