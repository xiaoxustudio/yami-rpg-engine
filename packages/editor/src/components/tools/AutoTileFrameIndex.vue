<template>
	<WindowFrame id="autoTile-frameIndex" ref="frame" no-buttons>
		<template #title
			><TitleBar
				>{{ t('components.autoTile-frameIndex.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="box" id="autoTile-frameIndex-screen" ref="screenRef">
			<div class="box" id="autoTile-frameIndex-image-clip" ref="clipRef">
				<img id="autoTile-frameIndex-image" alt="" ref="imageRef" />
				<div class="box" id="autoTile-frameIndex-mask" ref="maskRef" />
			</div>
			<MarqueeArea id="autoTile-frameIndex-marquee" ref="marqueeRef" />
			<div class="text" id="autoTile-frameIndex-info" ref="infoRef" />
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import {
	provideFrameIndexHandles,
	resetFrameIndexHandles,
	type FrameIndexHandles
} from '@app/composables/frame-index-handles';
import type { YamiElement } from '@app/types/element-api';
import { useI18n } from 'vue-i18n';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';

const { t } = useI18n();

/** 7 个节点一次交给单例（它用 getter 按需读，跨 open/close 复用）。 */
const frame = ref<InstanceType<typeof WindowFrame> | null>(null);
const screenRef = ref<unknown>(null);
const clipRef = ref<unknown>(null);
const imageRef = ref<unknown>(null);
const maskRef = ref<unknown>(null);
const marqueeRef = ref<unknown>(null);
const infoRef = ref<unknown>(null);

const rootOf = (target: unknown): YamiElement | null => {
	const instance = target as { root?: unknown; $el?: unknown } | null;
	const el = instance?.root ?? instance?.$el ?? target;
	return el instanceof HTMLElement ? (el as YamiElement) : null;
};

let handles: FrameIndexHandles | null = null;

onMounted(() => {
	const win = rootOf(frame.value);
	const screen = rootOf(screenRef.value);
	const clip = rootOf(clipRef.value);
	const image = rootOf(imageRef.value);
	const mask = rootOf(maskRef.value);
	const marquee = rootOf(marqueeRef.value);
	const info = rootOf(infoRef.value);
	if (!win || !screen || !clip || !image || !mask || !marquee || !info) return;
	handles = { win, screen, clip, mask, image, marquee, info };
	provideFrameIndexHandles(handles);
	onUnmounted(() => {
		if (handles) resetFrameIndexHandles(handles);
	});
});
</script>

<style>
#autoTile-frameIndex {
	width: auto;
	height: auto;
}

#autoTile-frameIndex-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: auto;
}

#autoTile-frameIndex-image-clip {
	position: absolute;
	overflow: hidden;
}

#autoTile-frameIndex-image {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
}

#autoTile-frameIndex-mask {
	position: absolute;
	width: 100%;
	height: 100%;
	border-left: 0 solid rgba(0, 0, 0, 0.5);
	border-top: 0 solid rgba(0, 0, 0, 0.5);
}

#autoTile-frameIndex-info {
	position: absolute;
	padding: 0 4px;
	line-height: 20px;
	color: white;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-shadow: var(--stage-info-text-shadow);
	pointer-events: none;
}
</style>
