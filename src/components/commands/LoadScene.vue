<template>
	<WindowFrame id="loadScene">
		<TitleBar>Load Scene<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Scene</text
				><FileVar id="loadScene-sceneId" type="file" filter="scene" />
				<text>Transfer Player</text><SelectBox id="loadScene-transfer" />
				<text>X</text
				><NumberVar id="loadScene-x" min="0" max="512" step="0.5" decimals="4" />
				<text>Y</text
				><NumberVar id="loadScene-y" min="0" max="512" step="0.5" decimals="4" />
			</grid-box>
			<button id="loadScene-confirm" name="confirm">Confirm</button>
			<button id="loadScene-cancel" name="cancel">Cancel</button>
		</content-frame>
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
