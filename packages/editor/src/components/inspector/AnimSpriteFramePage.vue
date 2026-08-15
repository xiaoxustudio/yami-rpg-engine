<template>
	<DetailBox id="animSpriteFrame-properties-detail" open>
		<DetailSummary>{{ local.getLabel('animSpriteFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSpriteFrame-properties-grid">
			<div class="text">{{ local.getLabel('animSpriteFrame-anchor-box') || 'Anchor' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-pivot-box') || 'Pivot' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-position-box') || 'Position' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-rotation-box') || 'Rotation' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-scale-box') || 'Scale' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-opacity-box') || 'Opacity' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-tint-0-box') || 'Tint - Red' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-tint-1-box') || 'Tint - Green' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-tint-2-box') || 'Tint - Blue' }}</div>
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
			<div class="text">{{ local.getLabel('animSpriteFrame-tint-3-box') || 'Tint - Grayscale' }}</div>
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
					@wheel.passive="onScreenWheel"
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
import { useAnimSpriteFramePage } from '@app/composables/useAnimSpriteFramePage';
import { Sprite } from '@/sprite/sprite.ts';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const local = useLocalStore();

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

onMounted(() => {
	const el = document.getElementById('animSpriteFrame-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
