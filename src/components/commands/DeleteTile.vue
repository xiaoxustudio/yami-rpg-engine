<template>
	<WindowFrame id="deleteTile">
		<TitleBar>Delete Tile<div class="close" /></TitleBar>
		<div class="content-frame">
			<div class="grid-box">
				<text>Tilemap</text><CustomBox id="deleteTile-tilemap" type="tilemap" />
				<text>Tilemap X</text
				><NumberVar id="deleteTile-tilemapX" min="0" max="511" />
				<text>Tilemap Y</text
				><NumberVar id="deleteTile-tilemapY" min="0" max="511" />
			</div>
			<button id="deleteTile-confirm" name="confirm">Confirm</button>
			<button id="deleteTile-cancel" name="cancel">Cancel</button>
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
