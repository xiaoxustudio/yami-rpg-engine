<template>
	<WindowFrame id="setTile">
		<template #title><TitleBar>Set Tile<div class="close" /></TitleBar></template>
		
			<div class="grid-box">
				<div class="text">Tilemap</div><CustomBox id="setTile-tilemap" type="tilemap" />
				<div class="text">Tilemap X</div><NumberVar id="setTile-tilemapX" min="0" max="511" />
				<div class="text">Tilemap Y</div><NumberVar id="setTile-tilemapY" min="0" max="511" />
				<div class="text">Tileset</div
				><CustomBox id="setTile-tilesetId" type="file" filter="tileset" />
				<div class="text">Tileset X</div><NumberVar id="setTile-tilesetX" min="0" max="255" />
				<div class="text">Tileset Y</div><NumberVar id="setTile-tilesetY" min="0" max="255" />
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
