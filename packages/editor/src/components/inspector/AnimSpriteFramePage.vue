<template>
	<DetailBox id="animSpriteFrame-properties-detail" open>
		<DetailSummary>{{ t('components.animSpriteFrame-properties-grid.label') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSpriteFrame-properties-grid">
			<div class="text">{{ t('components.animSpriteFrame-anchor-box.label') || 'Anchor' }}</div>
			<div
				id="animSpriteFrame-anchor-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-anchorX"
					v-model="form.anchorX"
					min="-10"
					max="10"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-anchorY"
					v-model="form.anchorY"
					min="-10"
					max="10"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-pivot-box.label') || 'Pivot' }}</div>
			<div
				id="animSpriteFrame-pivot-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-pivotX"
					v-model="form.pivotX"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-pivotY"
					v-model="form.pivotY"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-position-box.label') || 'Position' }}</div>
			<div
				id="animSpriteFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-x"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-y"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-rotation-box.label') || 'Rotation' }}</div>
			<div
				id="animSpriteFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-rotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-scale-box.label') || 'Scale' }}</div>
			<div
				id="animSpriteFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-scaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-scaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-opacity-box.label') || 'Opacity' }}</div>
			<div
				id="animSpriteFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-opacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-tint-0-box.label') || 'Tint - Red' }}</div>
			<div class="flex-box" id="animSpriteFrame-tint-0-box">
				<SliderBox
					id="animSpriteFrame-tint-0-slider"
					v-model="form.tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-0"
					v-model="form.tint[0]"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-tint-1-box.label') || 'Tint - Green' }}</div>
			<div class="flex-box" id="animSpriteFrame-tint-1-box">
				<SliderBox
					id="animSpriteFrame-tint-1-slider"
					v-model="form.tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-1"
					v-model="form.tint[1]"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-tint-2-box.label') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="animSpriteFrame-tint-2-box">
				<SliderBox
					id="animSpriteFrame-tint-2-slider"
					v-model="form.tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-2"
					v-model="form.tint[2]"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-tint-3-box.label') || 'Tint - Grayscale' }}</div>
			<div class="flex-box" id="animSpriteFrame-tint-3-box">
				<SliderBox
					id="animSpriteFrame-tint-3-slider"
					v-model="form.tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-3"
					v-model="form.tint[3]"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox id="animSpriteFrame-sprite-detail" open>
		<DetailSummary id="animSpriteFrame-sprite-summary">
			<div class="text" id="sprite-label">Sprite</div>
			<div class="box" id="sprite-info"></div>
			<SliderBox
				id="sprite-zoom"
				name="zoom"
				min="0"
				max="4"
				hotkey="-/+"
				@input="onZoomInput"
				@focus="onZoomFocus"
			></SliderBox>
		</DetailSummary>
		<div class="box" id="sprite-body">
			<div class="box" id="sprite-frame">
				<canvas id="sprite-canvas" width="0" height="0"></canvas>
				<div
					class="box"
					id="sprite-screen"
					tabindex="-1"
					@keydown="onScreenKeydown"
					@wheel="onScreenWheel"
				>
					<MarqueeArea
						id="sprite-marquee"
						@pointerdown="onMarqueePointerdown"
					></MarqueeArea>
				</div>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAnimSpriteFramePage } from '@app/composables/useAnimSpriteFramePage';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { Animation } from '@app/legacy/animation/animation-window.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput } = useAnimSpriteFramePage();

const onZoomInput = (value: number) => {
	Sprite?.setZoom?.(value);
};
const onZoomFocus = () => {
	Sprite?.zoomFocus?.();
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

const synchronize = (sliderId: string, inputId: string) => {
	const slider = document.getElementById(sliderId) as unknown as { synchronize?: (el: HTMLElement | null) => void } | null;
	const input = document.getElementById(inputId);
	slider?.synchronize?.(input);
};

onMounted(() => {
	const animSpriteFrame = Inspector.animSpriteFrame;
	if (!animSpriteFrame) return;

	synchronize('animSpriteFrame-tint-0-slider', 'animSpriteFrame-tint-0');
	synchronize('animSpriteFrame-tint-1-slider', 'animSpriteFrame-tint-1');
	synchronize('animSpriteFrame-tint-2-slider', 'animSpriteFrame-tint-2');
	synchronize('animSpriteFrame-tint-3-slider', 'animSpriteFrame-tint-3');

	const elements = document.querySelectorAll(`
    #animSpriteFrame-anchorX, #animSpriteFrame-anchorY,
    #animSpriteFrame-pivotX, #animSpriteFrame-pivotY,
    #animSpriteFrame-x, #animSpriteFrame-y, #animSpriteFrame-rotation,
    #animSpriteFrame-scaleX, #animSpriteFrame-scaleY, #animSpriteFrame-opacity,
    #animSpriteFrame-tint-0, #animSpriteFrame-tint-1, #animSpriteFrame-tint-2, #animSpriteFrame-tint-3`);
	const sliders = document.querySelectorAll(`
    #animSpriteFrame-tint-0-slider, #animSpriteFrame-tint-1-slider,
    #animSpriteFrame-tint-2-slider, #animSpriteFrame-tint-3-slider`);
	(elements as unknown as HTMLElement[]).forEach((el) =>
		el.addEventListener('focus', Inspector.inputFocus)
	);
	if (Inspector.inputBlur) {
		(elements as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.inputBlur!(animSpriteFrame, Animation, (data: Record<string, unknown>) => {
				data.type = 'inspector-frame-change';
				data.motion = animSpriteFrame.motion;
				data.direction = Animation.direction;
			}))
		);
	}
	if (Inspector.sliderFocus && Inspector.sliderBlur) {
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('focus', Inspector.sliderFocus)
		);
		(sliders as unknown as HTMLElement[]).forEach((el) =>
			el.addEventListener('blur', Inspector.sliderBlur)
		);
	}
	Sprite.initialize();

	const el = document.getElementById('animSpriteFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
