<template>
<WindowFrame id="wait">
	<TitleBar>Wait<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Duration</text
			><number-var id="wait-duration" min="1" max="3600000" unit="ms" />
		</grid-box>
		<button id="wait-confirm" name="confirm">Confirm</button>
		<button id="wait-cancel" name="cancel">Cancel</button>
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
