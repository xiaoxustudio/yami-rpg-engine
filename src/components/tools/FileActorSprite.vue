<template>
	<window-frame id="fileActor-sprite">
		<title-bar>Sprite<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Name</text><select-box id="fileActor-sprite-id" /> <text>Image</text
				><custom-box id="fileActor-sprite-image" type="file" filter="image" />
			</grid-box>
			<button id="fileActor-sprite-confirm" name="confirm">Confirm</button>
			<button id="fileActor-sprite-cancel" name="cancel">Cancel</button>
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
