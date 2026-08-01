<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('uiText-properties-grid') || 'Text Properties' }}</detail-summary>
		<detail-grid id="uiText-properties-grid">
			<text>{{ local.getLabel('uiText-direction') || 'Direction' }}</text><select-box id="uiText-direction"></select-box>
			<text>{{ local.getLabel('uiText-align-box') || 'Align' }}</text>
			<flex-box id="uiText-align-box">
				<radio-box
					id="uiText-align-left"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><text>&#xf036;</text></radio-box
				>
				<radio-box
					id="uiText-align-center"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><text>&#xf037;</text></radio-box
				>
				<radio-box
					id="uiText-align-right"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><text>&#xf038;</text></radio-box
				>
				<radio-box
					id="uiText-align-top"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><text>&#xf036;</text></radio-box
				>
				<radio-box
					id="uiText-align-middle"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><text>&#xf037;</text></radio-box
				>
				<radio-box
					id="uiText-align-bottom"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><text>&#xf038;</text></radio-box
				>
			</flex-box>
			<text>{{ local.getLabel('uiText-content') || 'Content' }}</text
			><text-area
				id="uiText-content"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></text-area>
			<text>{{ local.getLabel('uiText-size-box') || 'Size' }}</text>
			<flex-box id="uiText-size-box">
				<slider-box
					id="uiText-size-slider"
					min="12"
					max="52"
					step="2"
				></slider-box>
				<number-box
					id="uiText-size"
					min="10"
					max="400"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiText-lineSpacing-box') || 'Line Spacing' }}</text>
			<flex-box id="uiText-lineSpacing-box">
				<slider-box
					id="uiText-lineSpacing-slider"
					min="0"
					max="20"
					step="1"
				></slider-box>
				<number-box
					id="uiText-lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiText-letterSpacing-box') || 'Letter Spacing' }}</text>
			<flex-box id="uiText-letterSpacing-box">
				<slider-box
					id="uiText-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></slider-box>
				<number-box
					id="uiText-letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiText-color') || 'Color' }}</text><color-box id="uiText-color"></color-box>
			<text>{{ local.getLabel('uiText-font') || 'Font' }}</text><text-box id="uiText-font"></text-box>
			<text>{{ local.getLabel('uiText-typeface') || 'Typeface' }}</text><select-box id="uiText-typeface"></select-box>
			<text>{{ local.getLabel('uiText-effect-type') || 'Effect' }}</text><select-box id="uiText-effect-type"></select-box>
			<text>{{ local.getLabel('uiText-effect-shadowOffsetX') || 'Shadow X' }}</text
			><number-box
				id="uiText-effect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiText-effect-shadowOffsetY') || 'Shadow Y' }}</text
			><number-box
				id="uiText-effect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiText-effect-strokeWidth') || 'Stroke Width' }}</text
			><number-box
				id="uiText-effect-strokeWidth"
				min="1"
				max="20"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiText-effect-color') || 'Effect Color' }}</text
			><color-box id="uiText-effect-color"></color-box> <text>{{ local.getLabel('uiText-overflow') || 'Overflow' }}</text
			><select-box id="uiText-overflow"></select-box> <text>{{ local.getLabel('uiText-blend') || 'Blend' }}</text
			><select-box id="uiText-blend"></select-box>
		</detail-grid>
	</detail-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
