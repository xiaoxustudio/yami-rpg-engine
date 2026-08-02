<template>
	<DetailBox id="uiElement-general-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="uiElement-general-grid">
			<text>{{ local.getLabel('uiElement-name') || 'Name' }}</text><text-box id="uiElement-name"></text-box>
			<text>{{ local.getLabel('uiElement-pointerEvents') || 'Pointer Events' }}</text
			><select-box id="uiElement-pointerEvents"></select-box>
		</detail-grid>
	</DetailBox>
	<DetailBox id="uiElement-transform-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-transform-grid') || 'Transform' }}</DetailSummary>
		<detail-grid id="uiElement-transform-grid">
			<text>{{ local.getLabel('uiElement-transform-align-box') || 'Align' }}</text>
			<flex-box id="uiElement-transform-align-box">
				<button
					id="uiElement-transform-align-left"
					class="uiElement-transform-align"
					value="left"
				>
					<text>&#xf036;</text>
				</button>
				<button
					id="uiElement-transform-align-center"
					class="uiElement-transform-align"
					value="center"
				>
					<text>&#xf037;</text>
				</button>
				<button
					id="uiElement-transform-align-right"
					class="uiElement-transform-align"
					value="right"
				>
					<text>&#xf038;</text>
				</button>
				<button
					id="uiElement-transform-align-top"
					class="uiElement-transform-align rotated"
					value="top"
				>
					<text>&#xf036;</text>
				</button>
				<button
					id="uiElement-transform-align-middle"
					class="uiElement-transform-align rotated"
					value="middle"
				>
					<text>&#xf037;</text>
				</button>
				<button
					id="uiElement-transform-align-bottom"
					class="uiElement-transform-align rotated"
					value="bottom"
				>
					<text>&#xf038;</text>
				</button>
			</flex-box>
			<text>{{ local.getLabel('uiElement-transform-anchor-box') || 'Anchor' }}</text>
			<box
				id="uiElement-transform-anchor-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-anchorX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
				<number-box
					id="uiElement-transform-anchorY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-x-box') || 'X' }}</text>
			<box
				id="uiElement-transform-x-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-x"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></number-box>
				<number-box
					id="uiElement-transform-x2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-y-box') || 'Y' }}</text>
			<box
				id="uiElement-transform-y-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-y"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></number-box>
				<number-box
					id="uiElement-transform-y2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-width-box') || 'Width' }}</text>
			<box
				id="uiElement-transform-width-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-width"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></number-box>
				<number-box
					id="uiElement-transform-width2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-height-box') || 'Height' }}</text>
			<box
				id="uiElement-transform-height-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-height"
					min="-10000"
					max="10000"
					decimals="4"
					unit="px"
				></number-box>
				<number-box
					id="uiElement-transform-height2"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
					unit="r"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-rotation-box') || 'Rotation' }}</text>
			<box
				id="uiElement-transform-rotation-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-rotation"
					min="-36000"
					max="36000"
					decimals="4"
					unit="deg"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-scale-box') || 'Scale' }}</text>
			<box
				id="uiElement-transform-scale-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-scaleX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
				<number-box
					id="uiElement-transform-scaleY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-skew-box') || 'Skew' }}</text>
			<box
				id="uiElement-transform-skew-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-skewX"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
				<number-box
					id="uiElement-transform-skewY"
					min="-100"
					max="100"
					step="0.1"
					decimals="4"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiElement-transform-opacity-box') || 'Opacity' }}</text>
			<box
				id="uiElement-transform-opacity-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiElement-transform-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</box>
		</detail-grid>
	</DetailBox>
	<DetailBox id="uiElement-events-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-events') || 'Events' }}</DetailSummary>
		<param-list
			id="uiElement-events"
			class="inspector-list"
			filter="element"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox id="uiElement-scripts-group" open>
		<DetailSummary>{{ local.getLabel('uiElement-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="uiElement-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<parameter-pane id="uiElement-parameter-pane"></parameter-pane>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiImage-properties-grid') || 'Image Properties' }}</DetailSummary>
		<detail-grid id="uiImage-properties-grid">
			<text>{{ local.getLabel('uiImage-image') || 'Image' }}</text
			><custom-box id="uiImage-image" type="file" filter="image"></custom-box>
			<text>{{ local.getLabel('uiImage-display') || 'Display' }}</text><select-box id="uiImage-display"></select-box>
			<text>{{ local.getLabel('uiImage-flip') || 'Flip' }}</text><select-box id="uiImage-flip"></select-box>
			<text>{{ local.getLabel('uiImage-blend') || 'Blend' }}</text><select-box id="uiImage-blend"></select-box>
			<text>{{ local.getLabel('uiImage-shift-box') || 'Shift' }}</text>
			<box id="uiImage-shift-box" class="uiElement-grid-box with-2-columns">
				<number-box
					id="uiImage-shiftX"
					min="-10000"
					max="10000"
					unit="px"
				></number-box>
				<number-box
					id="uiImage-shiftY"
					min="-10000"
					max="10000"
					unit="px"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiImage-clip') || 'Clip' }}</text
			><custom-box
				id="uiImage-clip"
				type="clip"
				image="uiImage-image"
			></custom-box>
			<text>{{ local.getLabel('uiImage-border') || 'Border' }}</text
			><number-box
				id="uiImage-border"
				min="1"
				max="100"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiImage-tint-0-box') || 'Tint - Red' }}</text>
			<flex-box id="uiImage-tint-0-box">
				<slider-box
					id="uiImage-tint-0-slider"
					min="-255"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="uiImage-tint-0"
					min="-255"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiImage-tint-1-box') || 'Tint - Green' }}</text>
			<flex-box id="uiImage-tint-1-box">
				<slider-box
					id="uiImage-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="uiImage-tint-1"
					min="-255"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiImage-tint-2-box') || 'Tint - Blue' }}</text>
			<flex-box id="uiImage-tint-2-box">
				<slider-box
					id="uiImage-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="uiImage-tint-2"
					min="-255"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiImage-tint-3-box') || 'Tint - Grayscale' }}</text>
			<flex-box id="uiImage-tint-3-box">
				<slider-box
					id="uiImage-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></slider-box>
				<number-box
					id="uiImage-tint-3"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
