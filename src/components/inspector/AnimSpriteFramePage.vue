<template>
	<DetailBox id="animSpriteFrame-properties-detail" open>
		<DetailSummary>{{ local.getLabel('animSpriteFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<div class="detail-grid" id="animSpriteFrame-properties-grid">
			<text>{{ local.getLabel('animSpriteFrame-anchor-box') || 'Anchor' }}</text>
			<div
				id="animSpriteFrame-anchor-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-anchorX"
					min="-10"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-anchorY"
					min="-10"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-pivot-box') || 'Pivot' }}</text>
			<div
				id="animSpriteFrame-pivot-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-pivotX"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-pivotY"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-position-box') || 'Position' }}</text>
			<div
				id="animSpriteFrame-position-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-rotation-box') || 'Rotation' }}</text>
			<div
				id="animSpriteFrame-rotation-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-scale-box') || 'Scale' }}</text>
			<div
				id="animSpriteFrame-scale-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></NumberBox>
				<NumberBox
					id="animSpriteFrame-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-opacity-box') || 'Opacity' }}</text>
			<div
				id="animSpriteFrame-opacity-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-tint-0-box') || 'Tint - Red' }}</text>
			<div class="flex-box" id="animSpriteFrame-tint-0-box">
				<SliderBox
					id="animSpriteFrame-tint-0-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-tint-1-box') || 'Tint - Green' }}</text>
			<div class="flex-box" id="animSpriteFrame-tint-1-box">
				<SliderBox
					id="animSpriteFrame-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-tint-2-box') || 'Tint - Blue' }}</text>
			<div class="flex-box" id="animSpriteFrame-tint-2-box">
				<SliderBox
					id="animSpriteFrame-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('animSpriteFrame-tint-3-box') || 'Tint - Grayscale' }}</text>
			<div class="flex-box" id="animSpriteFrame-tint-3-box">
				<SliderBox
					id="animSpriteFrame-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="animSpriteFrame-tint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox id="animSpriteFrame-sprite-detail" open>
		<DetailSummary id="animSpriteFrame-sprite-summary">
			<text id="sprite-label">Sprite</text>
			<div class="box" id="sprite-info"></div>
			<SliderBox
				id="sprite-zoom"
				name="zoom"
				min="0"
				max="4"
				hotkey="-/+"
			></SliderBox>
		</DetailSummary>
		<div class="box" id="sprite-body">
			<div class="box" id="sprite-frame">
				<canvas id="sprite-canvas" width="0" height="0"></canvas>
				<div class="box" id="sprite-screen" tabindex="-1">
					<MarqueeArea id="sprite-marquee"></MarqueeArea>
				</div>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAnimationStore } from '@app/stores/animation';
import { useLocalStore } from '@app/stores/local';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';

const animation = useAnimationStore();
const local = useLocalStore();

onMounted(() => {
	animation.syncState();
	local.syncState();
});
</script>
