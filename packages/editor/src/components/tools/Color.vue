<template>
	<WindowFrame id="color">
		<TitleBar>Color Picker<div class="close" /></TitleBar>
		<div class="content-frame">
			<canvas id="color-palette-canvas" width="256" height="194" />
			<div class="box" id="color-palette-frame">
				<div class="box" id="color-palette-cursor" />
			</div>
			<div class="grid-box" id="color-index-grid">
				<RadioBox name="color-index" value="0" />
				<RadioBox name="color-index" value="1" />
				<RadioBox name="color-index" value="2" />
				<RadioBox name="color-index" value="3" />
				<RadioBox name="color-index" value="4" />
				<RadioBox name="color-index" value="5" />
				<RadioBox name="color-index" value="6" />
				<RadioBox name="color-index" value="7" />
				<RadioBox name="color-index" value="8" />
				<RadioBox name="color-index" value="9" />
				<RadioBox name="color-index" value="10" />
				<RadioBox name="color-index" value="11" />
				<RadioBox name="color-index" value="12" />
				<RadioBox name="color-index" value="13" />
				<RadioBox name="color-index" value="14" />
				<RadioBox name="color-index" value="15" />
			</div>
			<canvas id="color-pillar-canvas" width="20" height="256" />
			<div class="box" id="color-pillar-frame">
				<div class="box" id="color-pillar-cursor" />
			</div>
			<div class="box" id="color-viewer-frame">
				<div class="box" id="color-viewer" />
			</div>
			<div class="grid-box" id="color-rgba-grid">
				<div class="text">#</div><TextBox id="color-hex" /> <div class="text">R</div
				><NumberBox id="color-r" min="0" max="255" /> <div class="text">G</div
				><NumberBox id="color-g" min="0" max="255" /> <div class="text">B</div
				><NumberBox id="color-b" min="0" max="255" /> <div class="text">A</div
				><NumberBox id="color-a" min="0" max="255" />
			</div>
			<button id="color-confirm" name="confirm">Confirm</button>
			<button id="color-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
