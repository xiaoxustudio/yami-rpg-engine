<template>
	<WindowFrame id="loadScene">
		<TitleBar>Load Scene<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<div class="text">Scene</div
				><FileVar id="loadScene-sceneId" type="file" filter="scene" />
				<div class="text">Transfer Player</div><SelectBox id="loadScene-transfer" />
				<div class="text">X</div
				><NumberVar id="loadScene-x" min="0" max="512" step="0.5" decimals="4" />
				<div class="text">Y</div
				><NumberVar id="loadScene-y" min="0" max="512" step="0.5" decimals="4" />
			</div>
			<button id="loadScene-confirm" name="confirm">Confirm</button>
			<button id="loadScene-cancel" name="cancel">Cancel</button>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
