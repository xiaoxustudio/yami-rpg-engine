<template>
	<WindowFrame id="setResolution">
		<TitleBar>Set Resolution<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Width</text
				><number-var id="setResolution-width" min="240" max="7680" unit="px" />
				<text>Height</text
				><number-var id="setResolution-height" min="240" max="7680" unit="px" />
				<text>Scene Scale</text
				><number-var id="setResolution-sceneScale" min="0.5" max="4" decimals="10" />
				<text>UI Scale</text
				><number-var id="setResolution-uiScale" min="0.5" max="4" decimals="10" />
			</grid-box>
			<button id="setResolution-confirm" name="confirm">Confirm</button>
			<button id="setResolution-cancel" name="cancel">Cancel</button>
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
