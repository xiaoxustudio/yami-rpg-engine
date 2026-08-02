<template>
	<WindowFrame id="autoTile-frameIndex">
		<TitleBar>Tile Index<div class="close" /></TitleBar>
		<content-frame>
			<box id="autoTile-frameIndex-screen">
				<box id="autoTile-frameIndex-image-clip">
					<img id="autoTile-frameIndex-image" />
					<box id="autoTile-frameIndex-mask" />
				</box>
				<MarqueeArea id="autoTile-frameIndex-marquee" />
				<text id="autoTile-frameIndex-info" />
			</box>
		</content-frame>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
