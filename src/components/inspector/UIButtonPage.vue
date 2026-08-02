<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-image-properties-grid') || 'Image Properties' }}</DetailSummary>
		<detail-grid id="uiButton-image-properties-grid">
			<text>{{ local.getLabel('uiButton-display') || 'Display' }}</text><select-box id="uiButton-display"></select-box>
			<text>{{ local.getLabel('uiButton-normalImage') || 'Normal Image' }}</text
			><custom-box
				id="uiButton-normalImage"
				type="file"
				filter="image"
			></custom-box>
			<text>{{ local.getLabel('uiButton-normalClip') || 'Normal Clip' }}</text
			><custom-box
				id="uiButton-normalClip"
				type="clip"
				image="uiButton-normalImage"
			></custom-box>
			<text>{{ local.getLabel('uiButton-hoverImage') || 'Hover Image' }}</text
			><custom-box
				id="uiButton-hoverImage"
				type="file"
				filter="image"
			></custom-box>
			<text>{{ local.getLabel('uiButton-hoverClip') || 'Hover Clip' }}</text
			><custom-box
				id="uiButton-hoverClip"
				type="clip"
				image="uiButton-hoverImage"
			></custom-box>
			<text>{{ local.getLabel('uiButton-activeImage') || 'Active Image' }}</text
			><custom-box
				id="uiButton-activeImage"
				type="file"
				filter="image"
			></custom-box>
			<text>{{ local.getLabel('uiButton-activeClip') || 'Active Clip' }}</text
			><custom-box
				id="uiButton-activeClip"
				type="clip"
				image="uiButton-activeImage"
			></custom-box>
			<text>{{ local.getLabel('uiButton-flip') || 'Flip' }}</text><select-box id="uiButton-flip"></select-box>
			<text>{{ local.getLabel('uiButton-border') || 'Border' }}</text
			><number-box
				id="uiButton-border"
				min="1"
				max="100"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiButton-imagePadding-box') || 'Padding' }}</text>
			<flex-box id="uiButton-imagePadding-box">
				<slider-box
					id="uiButton-imagePadding-slider"
					min="0"
					max="20"
				></slider-box>
				<number-box
					id="uiButton-imagePadding"
					min="0"
					max="100"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiButton-imageOpacity-box') || 'Opacity' }}</text>
			<flex-box id="uiButton-imageOpacity-box">
				<slider-box
					id="uiButton-imageOpacity-slider"
					min="0"
					max="1"
					step="0.05"
				></slider-box>
				<number-box
					id="uiButton-imageOpacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiButton-imageEffect') || 'Effect' }}</text><select-box id="uiButton-imageEffect"></select-box>
			<text>{{ local.getLabel('uiButton-normalTint-box') || 'Normal Tint' }}</text>
			<box
				id="uiButton-normalTint-box"
				class="uiElement-grid-box with-4-columns"
			>
				<number-box
					id="uiButton-normalTint-0"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-normalTint-1"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-normalTint-2"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-normalTint-3"
					min="0"
					max="255"
					step="5"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiButton-hoverTint-box') || 'Hover Tint' }}</text>
			<box
				id="uiButton-hoverTint-box"
				class="uiElement-grid-box with-4-columns"
			>
				<number-box
					id="uiButton-hoverTint-0"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-hoverTint-1"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-hoverTint-2"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-hoverTint-3"
					min="0"
					max="255"
					step="5"
				></number-box>
			</box>
			<text>{{ local.getLabel('uiButton-activeTint-box') || 'Active Tint' }}</text>
			<box
				id="uiButton-activeTint-box"
				class="uiElement-grid-box with-4-columns"
			>
				<number-box
					id="uiButton-activeTint-0"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-activeTint-1"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-activeTint-2"
					min="-255"
					max="255"
					step="5"
				></number-box>
				<number-box
					id="uiButton-activeTint-3"
					min="0"
					max="255"
					step="5"
				></number-box>
			</box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-text-properties-grid') || 'Text Properties' }}</DetailSummary>
		<detail-grid id="uiButton-text-properties-grid">
			<text>{{ local.getLabel('uiButton-direction') || 'Direction' }}</text><select-box id="uiButton-direction"></select-box>
			<text>{{ local.getLabel('uiButton-align-box') || 'Align' }}</text>
			<flex-box id="uiButton-align-box">
				<radio-box
					id="uiButton-align-left"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><text>&#xf036;</text></radio-box
				>
				<radio-box
					id="uiButton-align-center"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><text>&#xf037;</text></radio-box
				>
				<radio-box
					id="uiButton-align-right"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><text>&#xf038;</text></radio-box
				>
				<radio-box
					id="uiButton-align-top"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><text>&#xf036;</text></radio-box
				>
				<radio-box
					id="uiButton-align-middle"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><text>&#xf037;</text></radio-box
				>
				<radio-box
					id="uiButton-align-bottom"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><text>&#xf038;</text></radio-box
				>
			</flex-box>
			<text>{{ local.getLabel('uiButton-content') || 'Content' }}</text
			><text-box
				id="uiButton-content"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></text-box>
			<text>{{ local.getLabel('uiButton-size-box') || 'Size' }}</text>
			<flex-box id="uiButton-size-box">
				<slider-box
					id="uiButton-size-slider"
					min="12"
					max="52"
					step="2"
				></slider-box>
				<number-box
					id="uiButton-size"
					min="10"
					max="400"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiButton-letterSpacing-box') || 'Letter Spacing' }}</text>
			<flex-box id="uiButton-letterSpacing-box">
				<slider-box
					id="uiButton-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></slider-box>
				<number-box
					id="uiButton-letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiButton-textPadding-box') || 'Padding' }}</text>
			<flex-box id="uiButton-textPadding-box">
				<slider-box
					id="uiButton-textPadding-slider"
					min="0"
					max="40"
					step="2"
				></slider-box>
				<number-box
					id="uiButton-textPadding"
					min="0"
					max="100"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiButton-font') || 'Font' }}</text><text-box id="uiButton-font"></text-box>
			<text>{{ local.getLabel('uiButton-typeface') || 'Typeface' }}</text><select-box id="uiButton-typeface"></select-box>
			<text>{{ local.getLabel('uiButton-textEffect-type') || 'Effect' }}</text
			><select-box id="uiButton-textEffect-type"></select-box>
			<text>{{ local.getLabel('uiButton-textEffect-shadowOffsetX') || 'Shadow X' }}</text
			><number-box
				id="uiButton-textEffect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiButton-textEffect-shadowOffsetY') || 'Shadow Y' }}</text
			><number-box
				id="uiButton-textEffect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiButton-textEffect-strokeWidth') || 'Stroke Width' }}</text
			><number-box
				id="uiButton-textEffect-strokeWidth"
				min="1"
				max="20"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiButton-textEffect-color') || 'Effect Color' }}</text
			><color-box id="uiButton-textEffect-color"></color-box>
			<text>{{ local.getLabel('uiButton-normalColor') || 'Normal Color' }}</text
			><color-box id="uiButton-normalColor"></color-box>
			<text>{{ local.getLabel('uiButton-hoverColor') || 'Hover Color' }}</text><color-box id="uiButton-hoverColor"></color-box>
			<text>{{ local.getLabel('uiButton-activeColor') || 'Active Color' }}</text
			><color-box id="uiButton-activeColor"></color-box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-sound-effects-grid') || 'Sound Effects' }}</DetailSummary>
		<detail-grid id="uiButton-sound-effects-grid">
			<text>{{ local.getLabel('uiButton-hoverSound') || 'Hover SE' }}</text
			><custom-box
				id="uiButton-hoverSound"
				type="file"
				filter="audio"
			></custom-box>
			<text>{{ local.getLabel('uiButton-clickSound') || 'Click SE' }}</text
			><custom-box
				id="uiButton-clickSound"
				type="file"
				filter="audio"
			></custom-box>
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
