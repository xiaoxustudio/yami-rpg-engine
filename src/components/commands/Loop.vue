<template>
<WindowFrame id="loop">
	<TitleBar>Loop<close /></TitleBar>
	<content-frame>
		<grid-box>
			<text>Mode</text><select-box id="loop-mode" /> <text>Conditions</text
			><param-list id="loop-conditions" />
		</grid-box>
		<button id="loop-confirm" name="confirm">Confirm</button>
		<button id="loop-cancel" name="cancel">Cancel</button>
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
