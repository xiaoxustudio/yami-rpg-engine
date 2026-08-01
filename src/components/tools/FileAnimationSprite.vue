<template>
	<window-frame id="fileAnimation-sprite">
		<title-bar>Sprite<close></close></title-bar>
		<content-frame>
			<grid-box>
				<text>Name</text><text-box id="fileAnimation-sprite-name" /> <text>Image</text
				><custom-box id="fileAnimation-sprite-image" type="file" filter="image" />
				<text>Horiz Frames</text
				><number-box id="fileAnimation-sprite-hframes" min="1" max="256" />
				<text>Vert Frames</text
				><number-box id="fileAnimation-sprite-vframes" min="1" max="256" />
			</grid-box>
			<button id="fileAnimation-sprite-confirm" name="confirm">Confirm</button>
			<button id="fileAnimation-sprite-cancel" name="cancel">Cancel</button>
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
