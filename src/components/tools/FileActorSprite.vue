<template>
	<WindowFrame id="fileActor-sprite">
		<TitleBar>Sprite<close></close></TitleBar>
		<content-frame>
			<grid-box>
				<text>Name</text><select-box id="fileActor-sprite-id" /> <text>Image</text
				><custom-box id="fileActor-sprite-image" type="file" filter="image" />
			</grid-box>
			<button id="fileActor-sprite-confirm" name="confirm">Confirm</button>
			<button id="fileActor-sprite-cancel" name="cancel">Cancel</button>
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
