<template>
	<WindowFrame id="setTile">
		<TitleBar>Set Tile<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Tilemap</text><CustomBox id="setTile-tilemap" type="tilemap" />
				<text>Tilemap X</text><NumberVar id="setTile-tilemapX" min="0" max="511" />
				<text>Tilemap Y</text><NumberVar id="setTile-tilemapY" min="0" max="511" />
				<text>Tileset</text
				><CustomBox id="setTile-tilesetId" type="file" filter="tileset" />
				<text>Tileset X</text><NumberVar id="setTile-tilesetX" min="0" max="255" />
				<text>Tileset Y</text><NumberVar id="setTile-tilesetY" min="0" max="255" />
			</div>
			<button id="setTile-confirm" name="confirm">Confirm</button>
			<button id="setTile-cancel" name="cancel">Cancel</button>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberVar from '@app/components/common/NumberVar.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
