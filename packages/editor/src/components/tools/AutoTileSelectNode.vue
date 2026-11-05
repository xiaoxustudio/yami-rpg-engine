<template>
	<WindowFrame ref="frame" id="autoTile-selectNode" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.autoTile-selectNode.title') }}
				<div class="close" /></TitleBar
		></template>

		<canvas id="autoTile-selectNode-canvas" ref="canvasRef" width="0" height="0" />
		<div class="box" id="autoTile-selectNode-screen" ref="screenRef">
			<MarqueeArea id="autoTile-selectNode-marquee" ref="marqueeRef" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {
	provideTileNodeHandles,
	resetTileNodeHandles,
	type TileNodeHandles
} from '@app/composables/auto-tile-handles';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { on } from '@app/utils/element-utils';
import { useTileNodeWindow } from '@app/composables/useTileNodeWindow';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';

const { t } = useI18n();

const tileNode = useTileNodeWindow();

/** 画布 / 容器 / 选框三个节点一次交给 `useTileNodeWindow`。 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const canvasRef = ref<unknown>(null);
const screenRef = ref<unknown>(null);
const marqueeRef = ref<unknown>(null);

let handles: TileNodeHandles | null = null;

onMounted(() => {
	const root = frame.value?.root ?? null;
	const canvas = canvasRef.value as HTMLCanvasElement | null;
	const screen = screenRef.value as HTMLElement | null;
	const marquee = (marqueeRef.value as { root?: unknown } | null)?.root ?? null;
	if (!root || !canvas || !screen || !(marquee instanceof HTMLElement)) return;
	on(root, 'closed', () => tileNode.windowClosed());
	handles = { root, canvas, screen, marquee: marquee as TileNodeHandles['marquee'] };
	provideTileNodeHandles(handles);
	onUnmounted(() => {
		if (handles) resetTileNodeHandles(handles);
	});
});
</script>

<style>
#autoTile-selectNode {
	width: auto;
	height: auto;
}

#autoTile-selectNode-canvas {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
}

#autoTile-selectNode-screen {
	position: absolute;
	width: 100%;
	height: 100%;
}
</style>
