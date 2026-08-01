<template>
	<window-frame id="setTile">
		<title-bar>Set Tile<close /></title-bar>
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
	</window-frame>
	
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
