<template>
	<WindowFrame ref="frame" id="autoTile-selectNode" no-buttons>
		<template #title><TitleBar>Tile Node<div class="close" /></TitleBar></template>
		
			<canvas id="autoTile-selectNode-canvas" width="0" height="0" />
			<div class="box" id="autoTile-selectNode-screen">
				<MarqueeArea id="autoTile-selectNode-marquee" />
			</div>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';

const tileNode = useTileNodeWindow();

const inspector = useInspectorStore();
const local = useLocalStore();

const frame = ref<InstanceType<typeof WindowFrame> | null>(null);

onMounted(() => {
	const el = frame.value?.root;
	if (el) {
		el.on('closed', () => tileNode.windowClosed());
	}


});
</script>
