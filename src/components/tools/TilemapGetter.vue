<template>
	<!-- 瓦片地图访问器窗口 -->
	<WindowFrame id="tilemapGetter">
		<TitleBar>Tilemap<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Type</text><select-box id="tilemapGetter-type" /> <text>Tilemap</text
				><custom-box
					id="tilemapGetter-presetId"
					type="preset-object"
					filter="tilemap"
				/>
				<text>Variable</text
				><custom-box id="tilemapGetter-variable" type="variable" filter="object" />
			</grid-box>
			<button id="tilemapGetter-confirm" name="confirm">Confirm</button>
			<button id="tilemapGetter-cancel" name="cancel">Cancel</button>
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
