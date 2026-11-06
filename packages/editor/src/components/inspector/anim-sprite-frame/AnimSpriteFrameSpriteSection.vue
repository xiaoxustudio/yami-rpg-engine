<template>
	<DetailBox id="animSpriteFrame-sprite-detail" ref="spriteDetailRef" open>
		<DetailSummary id="animSpriteFrame-sprite-summary">
			<div class="text" id="sprite-label">{{ t('components.sprite-label.content') }}</div>
			<div class="box" id="sprite-info" ref="infoRef"></div>
			<SliderBox
				id="sprite-zoom"
				ref="zoomRef"
				name="zoom"
				min="0"
				max="4"
				hotkey="-/+"
				@input="onZoomInput"
				@focus="onZoomFocus"
			></SliderBox>
		</DetailSummary>
		<div class="box" id="sprite-body" ref="bodyRef">
			<div class="box" id="sprite-frame" ref="frameRef">
				<canvas id="sprite-canvas" ref="canvasRef" width="0" height="0"></canvas>
				<div
					class="box"
					id="sprite-screen"
					ref="screenRef"
					tabindex="-1"
					@keydown="onScreenKeydown"
					@wheel="onScreenWheel"
				>
					<MarqueeArea
						id="sprite-marquee"
						ref="marqueeRef"
						@pointerdown="onMarqueePointerdown"
					></MarqueeArea>
				</div>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { spriteNodes, type SpriteNodeKey } from '@app/composables/sprite-nodes';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const { t } = useI18n();

const onZoomInput = (value: number) => {
	Sprite?.setZoom?.(value);
};
const onZoomFocus = (event: FocusEvent) => {
	Sprite?.zoomFocus?.(event);
};
const onScreenKeydown = (event: KeyboardEvent) => {
	Sprite?.screenKeydown?.(event);
};
const onScreenWheel = (event: WheelEvent) => {
	Sprite?.screenWheel?.(event);
};
const onMarqueePointerdown = (event: PointerEvent) => {
	Sprite?.marqueePointerdown?.(event);
};

/** 骨架节点登记：模板 ref 就位后写进 spriteNodes，卸载注销。 */
const spriteDetailRef = ref<{ root?: HTMLElement } | null>(null);
const infoRef = ref<HTMLElement | null>(null);
const zoomRef = ref<{ root?: HTMLElement } | null>(null);
const bodyRef = ref<HTMLElement | null>(null);
const frameRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLElement | null>(null);
const screenRef = ref<{ root?: HTMLElement } | null>(null);
const marqueeRef = ref<{ root?: HTMLElement } | null>(null);

const rootsOf = (): Array<[SpriteNodeKey, HTMLElement | null]> => [
	['spriteDetail', spriteDetailRef.value?.root ?? null],
	['info', infoRef.value],
	['zoom', zoomRef.value?.root ?? null],
	['body', bodyRef.value],
	['frame', frameRef.value],
	['canvas', canvasRef.value],
	['screen', screenRef.value?.root ?? null],
	['marquee', marqueeRef.value?.root ?? null]
];

onMounted(() => {
	for (const [key, element] of rootsOf()) spriteNodes.set(key, element);
});

onUnmounted(() => {
	for (const [key, element] of rootsOf()) spriteNodes.clear(key, element);
});
</script>
