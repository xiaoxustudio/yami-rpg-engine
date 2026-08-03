<template>
	<WindowFrame id="autoTile-selectNode">
		<TitleBar>Tile Node<div class="close" /></TitleBar>
		<div class="content-frame">
			<canvas id="autoTile-selectNode-canvas" width="0" height="0" />
			<div class="box" id="autoTile-selectNode-screen">
				<MarqueeArea id="autoTile-selectNode-marquee" />
			</div>
		</div>
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
