<template>
		<WindowFrame id="scene-shift">
		<TitleBar>Shift<div class="close"></div></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Shift X</text><NumberBox id="scene-shift-x" min="-512" max="512" />
				<text>Shift Y</text><NumberBox id="scene-shift-y" min="-512" max="512" />
			</div>
			<button id="scene-shift-confirm" name="confirm">Confirm</button>
			<button id="scene-shift-cancel" name="cancel">Cancel</button>
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

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
