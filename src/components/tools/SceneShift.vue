<template>
		<WindowFrame id="scene-shift">
		<TitleBar>Shift<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Shift X</text><number-box id="scene-shift-x" min="-512" max="512" />
				<text>Shift Y</text><number-box id="scene-shift-y" min="-512" max="512" />
			</grid-box>
			<button id="scene-shift-confirm" name="confirm">Confirm</button>
			<button id="scene-shift-cancel" name="cancel">Cancel</button>
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
