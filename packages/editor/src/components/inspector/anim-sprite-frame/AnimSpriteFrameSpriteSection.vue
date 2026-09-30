<template>
	<DetailBox
		id="animSpriteFrame-sprite-detail"
		:ref="registryRef(engineEls, 'animSpriteFrame-sprite-detail')"
		open
	>
		<DetailSummary id="animSpriteFrame-sprite-summary">
			<div class="text" id="sprite-label">{{ t('components.sprite-label.content') }}</div>
			<div class="box" id="sprite-info" :ref="registryRef(engineEls, 'sprite-info')"></div>
			<SliderBox
				id="sprite-zoom"
				:ref="registryRef(engineEls, 'sprite-zoom')"
				name="zoom"
				min="0"
				max="4"
				hotkey="-/+"
				@input="onZoomInput"
				@focus="onZoomFocus"
			></SliderBox>
		</DetailSummary>
		<div class="box" id="sprite-body" :ref="registryRef(engineEls, 'sprite-body')">
			<div class="box" id="sprite-frame" :ref="registryRef(engineEls, 'sprite-frame')">
				<canvas
					id="sprite-canvas"
					:ref="registryRef(engineEls, 'sprite-canvas')"
					width="0"
					height="0"
				></canvas>
				<div
					class="box"
					id="sprite-screen"
					:ref="registryRef(engineEls, 'sprite-screen')"
					tabindex="-1"
					@keydown="onScreenKeydown"
					@wheel="onScreenWheel"
				>
					<MarqueeArea
						id="sprite-marquee"
						:ref="registryRef(engineEls, 'sprite-marquee')"
						@pointerdown="onMarqueePointerdown"
					></MarqueeArea>
				</div>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { engineEls } from '@app/engine/element-registry';
import { registryRef } from '@app/utils/element-registry';
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
</script>
