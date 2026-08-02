<template>
	<WindowFrame id="autoTile-generateFrames">
		<TitleBar>Generate Frames<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Stride X</text
				><number-box id="autoTile-generateFrames-strideX" min="-128" max="128" />
				<text>Stride Y</text
				><number-box id="autoTile-generateFrames-strideY" min="-128" max="128" />
				<text>Count</text
				><number-box id="autoTile-generateFrames-count" min="1" max="255" />
			</grid-box>
			<button id="autoTile-generateFrames-confirm" name="confirm">Confirm</button>
			<button id="autoTile-generateFrames-cancel" name="cancel">Cancel</button>
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
