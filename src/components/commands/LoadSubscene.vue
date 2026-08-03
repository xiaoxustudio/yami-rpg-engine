<template>
	<WindowFrame id="loadSubscene">
		<TitleBar>Load Subscene<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Scene</div
				><FileVar id="loadSubscene-sceneId" type="file" filter="scene" />
				<div class="text">Shift X</div><NumberVar id="loadSubscene-shiftX" min="0" max="512" />
				<div class="text">Shift Y</div><NumberVar id="loadSubscene-shiftY" min="0" max="512" />
			</div>
			<button id="loadSubscene-confirm" name="confirm">Confirm</button>
			<button id="loadSubscene-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import FileVar from '@app/components/common/FileVar.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
