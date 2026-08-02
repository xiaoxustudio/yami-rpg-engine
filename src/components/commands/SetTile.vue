<template>
	<WindowFrame id="setTile">
		<TitleBar>Set Tile<close /></TitleBar>
		<content-frame>
			<grid-box>
				<text>Tilemap</text><custom-box id="setTile-tilemap" type="tilemap" />
				<text>Tilemap X</text><number-var id="setTile-tilemapX" min="0" max="511" />
				<text>Tilemap Y</text><number-var id="setTile-tilemapY" min="0" max="511" />
				<text>Tileset</text
				><custom-box id="setTile-tilesetId" type="file" filter="tileset" />
				<text>Tileset X</text><number-var id="setTile-tilesetX" min="0" max="255" />
				<text>Tileset Y</text><number-var id="setTile-tilesetY" min="0" max="255" />
			</grid-box>
			<button id="setTile-confirm" name="confirm">Confirm</button>
			<button id="setTile-cancel" name="cancel">Cancel</button>
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
