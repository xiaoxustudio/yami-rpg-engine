<template>
	<DetailBox id="animSpriteFrame-properties-detail"
				:ref="registryRef(engineEls, 'animSpriteFrame-properties-detail')" open>
		<DetailSummary>{{
			t('components.animSpriteFrame-properties-grid.label') || 'Frame'
		}}</DetailSummary>
		<div class="detail-grid" id="animSpriteFrame-properties-grid">
			<div class="text">
				{{ t('components.animSpriteFrame-anchor-box.label') || 'Anchor' }}
			</div>
			<div id="animSpriteFrame-anchor-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animSpriteFrame-anchorX"
				v-tip="t('components.animSpriteFrame-anchorX.tip')"
					ref="elAnchorX"
					v-model="form.anchorX"
					min="-10"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-anchorY"
				v-tip="t('components.animSpriteFrame-anchorY.tip')"
					ref="elAnchorY"
					v-model="form.anchorY"
					min="-10"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-pivot-box.label') || 'Pivot' }}</div>
			<div id="animSpriteFrame-pivot-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animSpriteFrame-pivotX"
				v-tip="t('components.animSpriteFrame-pivotX.tip')"
					ref="elPivotX"
					v-model="form.pivotX"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-pivotY"
				v-tip="t('components.animSpriteFrame-pivotY.tip')"
					ref="elPivotY"
					v-model="form.pivotY"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-position-box.label') || 'Position' }}
			</div>
			<div id="animSpriteFrame-position-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animSpriteFrame-x"
				v-tip="t('components.animSpriteFrame-x.tip')"
					ref="elX"
					v-model="form.x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-y"
				v-tip="t('components.animSpriteFrame-y.tip')"
					ref="elY"
					v-model="form.y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-rotation-box.label') || 'Rotation' }}
			</div>
			<div id="animSpriteFrame-rotation-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animSpriteFrame-rotation"
				v-tip="t('components.animSpriteFrame-rotation.tip')"
					ref="elRotation"
					v-model="form.rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ t('components.animSpriteFrame-scale-box.label') || 'Scale' }}</div>
			<div id="animSpriteFrame-scale-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animSpriteFrame-scaleX"
				v-tip="t('components.animSpriteFrame-scaleX.tip')"
					ref="elScaleX"
					v-model="form.scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-scaleY"
				v-tip="t('components.animSpriteFrame-scaleY.tip')"
					ref="elScaleY"
					v-model="form.scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-opacity-box.label') || 'Opacity' }}
			</div>
			<div id="animSpriteFrame-opacity-box" class="box uiElement-grid-box with-2-columns">
				<NumberBox
					id="animSpriteFrame-opacity"
				v-tip="t('components.animSpriteFrame-opacity.tip')"
					ref="elOpacity"
					v-model="form.opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-tint-0-box.label') || 'Tint - Red' }}
			</div>
			<div class="flex-box" id="animSpriteFrame-tint-0-box"
				v-tip="t('components.animSpriteFrame-tint-0-box.tip')">
				<SliderBox
					id="animSpriteFrame-tint-0-slider"
					ref="elTint0Slider"
					v-model="tint[0]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-0"
					ref="elTint0"
					v-model="tint[0]"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-tint-1-box.label') || 'Tint - Green' }}
			</div>
			<div class="flex-box" id="animSpriteFrame-tint-1-box"
				v-tip="t('components.animSpriteFrame-tint-1-box.tip')">
				<SliderBox
					id="animSpriteFrame-tint-1-slider"
					ref="elTint1Slider"
					v-model="tint[1]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-1"
					ref="elTint1"
					v-model="tint[1]"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-tint-2-box.label') || 'Tint - Blue' }}
			</div>
			<div class="flex-box" id="animSpriteFrame-tint-2-box"
				v-tip="t('components.animSpriteFrame-tint-2-box.tip')">
				<SliderBox
					id="animSpriteFrame-tint-2-slider"
					ref="elTint2Slider"
					v-model="tint[2]"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-2"
					ref="elTint2"
					v-model="tint[2]"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">
				{{ t('components.animSpriteFrame-tint-3-box.label') || 'Tint - Grayscale' }}
			</div>
			<div class="flex-box" id="animSpriteFrame-tint-3-box"
				v-tip="t('components.animSpriteFrame-tint-3-box.tip')">
				<SliderBox
					id="animSpriteFrame-tint-3-slider"
					ref="elTint3Slider"
					v-model="tint[3]"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-3"
					ref="elTint3"
					v-model="tint[3]"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox id="animSpriteFrame-sprite-detail"
				:ref="registryRef(engineEls, 'animSpriteFrame-sprite-detail')" open>
		<DetailSummary id="animSpriteFrame-sprite-summary">
			<div class="text" id="sprite-label">{{ t('components.sprite-label.content') }}</div>
			<div class="box" id="sprite-info"
				:ref="registryRef(engineEls, 'sprite-info')"></div>
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
		<div class="box" id="sprite-body"
				:ref="registryRef(engineEls, 'sprite-body')">
			<div class="box" id="sprite-frame"
				:ref="registryRef(engineEls, 'sprite-frame')">
				<canvas id="sprite-canvas"
				:ref="registryRef(engineEls, 'sprite-canvas')" width="0" height="0"></canvas>
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
import { computed, onMounted, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { engineEls } from '@app/engine/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useAnimSpriteFramePage } from '@app/composables/useAnimSpriteFramePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Sprite } from '@app/engine/sprite/sprite.ts';
import { Inspector } from '@app/inspector/inspector.ts';
import { Animation } from '@app/animation/animation-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const { t } = useI18n();

const { form, sync, onParamInput: onParamInputEvent } = useAnimSpriteFramePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as unknown as Event);
};

const tint = computed(() => form.tint as number[]);

const { bindInput, bindSliders } = useInspectorInput();

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

const elAnchorX = ref<InstanceType<typeof NumberBox> | null>(null);
const elAnchorY = ref<InstanceType<typeof NumberBox> | null>(null);
const elPivotX = ref<InstanceType<typeof NumberBox> | null>(null);
const elPivotY = ref<InstanceType<typeof NumberBox> | null>(null);
const elX = ref<InstanceType<typeof NumberBox> | null>(null);
const elY = ref<InstanceType<typeof NumberBox> | null>(null);
const elRotation = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleX = ref<InstanceType<typeof NumberBox> | null>(null);
const elScaleY = ref<InstanceType<typeof NumberBox> | null>(null);
const elOpacity = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint0 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint1 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint2 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint3 = ref<InstanceType<typeof NumberBox> | null>(null);
const elTint0Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint1Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint2Slider = ref<InstanceType<typeof SliderBox> | null>(null);
const elTint3Slider = ref<InstanceType<typeof SliderBox> | null>(null);

onMounted(() => {
	const animSpriteFrame = Inspector.animSpriteFrame;
	if (!animSpriteFrame) return;

	const tintSliders = [elTint0Slider, elTint1Slider, elTint2Slider, elTint3Slider];
	const tintNumbers = [elTint0, elTint1, elTint2, elTint3];
	tintSliders.forEach((slider, index) => {
		const target = tintNumbers[index].value?.root;
		if (!target) return;
		slider.value?.synchronize(
			target as HTMLElement & {
				write(value: number | string): void;
				input: HTMLInputElement;
			}
		);
	});

	const elements = [
		elAnchorX.value?.root,
		elAnchorY.value?.root,
		elPivotX.value?.root,
		elPivotY.value?.root,
		elX.value?.root,
		elY.value?.root,
		elRotation.value?.root,
		elScaleX.value?.root,
		elScaleY.value?.root,
		elOpacity.value?.root,
		elTint0.value?.root,
		elTint1.value?.root,
		elTint2.value?.root,
		elTint3.value?.root
	].filter((el): el is HTMLElement => el != null);
	const sliders = [
		elTint0Slider.value?.root,
		elTint1Slider.value?.root,
		elTint2Slider.value?.root,
		elTint3Slider.value?.root
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, animSpriteFrame, Animation as unknown as { history: unknown }, (data: Record<string, unknown>) => {
		data.type = 'inspector-frame-change';
		data.motion = animSpriteFrame.motion;
		data.direction = Animation.direction;
	});
	bindSliders(sliders);
	Sprite.initialize();

	const el = inspectorEls.get('animSpriteFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
