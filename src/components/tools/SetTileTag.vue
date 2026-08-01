<template>
	<window-frame id="setTileTag">
		<title-bar>Set Tile Tag<close /></title-bar>
		<content-frame>
			<grid-box>
				<text>Tag</text><number-box id="setTileTag-tag" min="0" max="99999" />
			</grid-box>
			<button id="setTileTag-confirm" name="confirm">Confirm</button>
			<button id="setTileTag-cancel" name="cancel">Cancel</button>
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
