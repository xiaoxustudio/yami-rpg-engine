<template>
	<DetailBox id="animSpriteFrame-properties-detail" open>
		<DetailSummary>{{ local.getLabel('animSpriteFrame-properties-grid') || 'Frame' }}</DetailSummary>
		<detail-grid id="animSpriteFrame-properties-grid">
			<text>{{ local.getLabel('animSpriteFrame-anchor-box') || 'Anchor' }}</text>
			<box
				id="animSpriteFrame-anchor-box"
				class="uiElement-grid-box with-2-columns"
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
			</box>
			<text>{{ local.getLabel('animSpriteFrame-pivot-box') || 'Pivot' }}</text>
			<box
				id="animSpriteFrame-pivot-box"
				class="uiElement-grid-box with-2-columns"
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
			</box>
			<text>{{ local.getLabel('animSpriteFrame-position-box') || 'Position' }}</text>
			<box
				id="animSpriteFrame-position-box"
				class="uiElement-grid-box with-2-columns"
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
			</box>
			<text>{{ local.getLabel('animSpriteFrame-rotation-box') || 'Rotation' }}</text>
			<box
				id="animSpriteFrame-rotation-box"
				class="uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				></NumberBox>
			</box>
			<text>{{ local.getLabel('animSpriteFrame-scale-box') || 'Scale' }}</text>
			<box
				id="animSpriteFrame-scale-box"
				class="uiElement-grid-box with-2-columns"
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
			</box>
			<text>{{ local.getLabel('animSpriteFrame-opacity-box') || 'Opacity' }}</text>
			<box
				id="animSpriteFrame-opacity-box"
				class="uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="animSpriteFrame-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</box>
			<text>{{ local.getLabel('animSpriteFrame-tint-0-box') || 'Tint - Red' }}</text>
			<flex-box id="animSpriteFrame-tint-0-box">
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
			</flex-box>
			<text>{{ local.getLabel('animSpriteFrame-tint-1-box') || 'Tint - Green' }}</text>
			<flex-box id="animSpriteFrame-tint-1-box">
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
			</flex-box>
			<text>{{ local.getLabel('animSpriteFrame-tint-2-box') || 'Tint - Blue' }}</text>
			<flex-box id="animSpriteFrame-tint-2-box">
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
			</flex-box>
			<text>{{ local.getLabel('animSpriteFrame-tint-3-box') || 'Tint - Grayscale' }}</text>
			<flex-box id="animSpriteFrame-tint-3-box">
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
			</flex-box>
		</detail-grid>
	</DetailBox>
	<DetailBox id="animSpriteFrame-sprite-detail" open>
		<DetailSummary id="animSpriteFrame-sprite-summary">
			<text id="sprite-label">Sprite</text>
			<box id="sprite-info"></box>
			<SliderBox
				id="sprite-zoom"
				name="zoom"
				min="0"
				max="4"
				hotkey="-/+"
			></SliderBox>
		</DetailSummary>
		<box id="sprite-body">
			<box id="sprite-frame">
				<canvas id="sprite-canvas" width="0" height="0"></canvas>
				<box id="sprite-screen" tabindex="-1">
					<MarqueeArea id="sprite-marquee"></MarqueeArea>
				</box>
			</box>
		</box>
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
