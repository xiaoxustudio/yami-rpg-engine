<template>
	<WindowFrame id="deleteTile">
		<TitleBar>Delete Tile<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Tilemap</text><custom-box id="deleteTile-tilemap" type="tilemap" />
				<text>Tilemap X</text
				><number-var id="deleteTile-tilemapX" min="0" max="511" />
				<text>Tilemap Y</text
				><number-var id="deleteTile-tilemapY" min="0" max="511" />
			</grid-box>
			<button id="deleteTile-confirm" name="confirm">Confirm</button>
			<button id="deleteTile-cancel" name="cancel">Cancel</button>
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
