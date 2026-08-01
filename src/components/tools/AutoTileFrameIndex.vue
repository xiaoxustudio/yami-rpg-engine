<template>
	<window-frame id="autoTile-frameIndex">
		<title-bar>Tile Index<close /></title-bar>
		<content-frame>
			<box id="autoTile-frameIndex-screen">
				<box id="autoTile-frameIndex-image-clip">
					<img id="autoTile-frameIndex-image" />
					<box id="autoTile-frameIndex-mask" />
				</box>
				<marquee-area id="autoTile-frameIndex-marquee" />
				<text id="autoTile-frameIndex-info" />
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
