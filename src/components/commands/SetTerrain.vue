<template>
	<WindowFrame id="setTerrain">
		<TitleBar>Set Terrain<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Position</text><CustomBox id="setTerrain-position" type="position" />
				<text>Terrain</text><SelectBox id="setTerrain-terrain" />
			</grid-box>
			<button id="setTerrain-confirm" name="confirm">Confirm</button>
			<button id="setTerrain-cancel" name="cancel">Cancel</button>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
