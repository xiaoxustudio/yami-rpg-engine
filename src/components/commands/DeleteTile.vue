<template>
	<window-frame id="deleteTile">
		<title-bar>Delete Tile<close /></title-bar>
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
