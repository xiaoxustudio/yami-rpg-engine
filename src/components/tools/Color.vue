<template>
	<WindowFrame id="color">
		<TitleBar>Color Picker<close /></TitleBar>
		<content-frame>
			<canvas id="color-palette-canvas" width="256" height="194" />
			<box id="color-palette-frame">
				<box id="color-palette-cursor" />
			</box>
			<grid-box id="color-index-grid">
				<radio-box name="color-index" value="0" />
				<radio-box name="color-index" value="1" />
				<radio-box name="color-index" value="2" />
				<radio-box name="color-index" value="3" />
				<radio-box name="color-index" value="4" />
				<radio-box name="color-index" value="5" />
				<radio-box name="color-index" value="6" />
				<radio-box name="color-index" value="7" />
				<radio-box name="color-index" value="8" />
				<radio-box name="color-index" value="9" />
				<radio-box name="color-index" value="10" />
				<radio-box name="color-index" value="11" />
				<radio-box name="color-index" value="12" />
				<radio-box name="color-index" value="13" />
				<radio-box name="color-index" value="14" />
				<radio-box name="color-index" value="15" />
			</grid-box>
			<canvas id="color-pillar-canvas" width="20" height="256" />
			<box id="color-pillar-frame">
				<box id="color-pillar-cursor" />
			</box>
			<box id="color-viewer-frame">
				<box id="color-viewer" />
			</box>
			<grid-box id="color-rgba-grid">
				<text>#</text><text-box id="color-hex" /> <text>R</text
				><number-box id="color-r" min="0" max="255" /> <text>G</text
				><number-box id="color-g" min="0" max="255" /> <text>B</text
				><number-box id="color-b" min="0" max="255" /> <text>A</text
				><number-box id="color-a" min="0" max="255" />
			</grid-box>
			<button id="color-confirm" name="confirm">Confirm</button>
			<button id="color-cancel" name="cancel">Cancel</button>
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
