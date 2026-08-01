<template>
	<window-frame id="autoTile-selectNode">
		<title-bar>Tile Node<close /></title-bar>
		<content-frame>
			<canvas id="autoTile-selectNode-canvas" width="0" height="0" />
			<box id="autoTile-selectNode-screen">
				<marquee-area id="autoTile-selectNode-marquee" />
			</box>
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
