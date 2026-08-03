<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-image-properties-grid') || 'Image Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-image-properties-grid">
			<text>{{ local.getLabel('uiButton-display') || 'Display' }}</text><SelectBox id="uiButton-display"></SelectBox>
			<text>{{ local.getLabel('uiButton-normalImage') || 'Normal Image' }}</text
			><CustomBox
				id="uiButton-normalImage"
				type="file"
				filter="image"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-normalClip') || 'Normal Clip' }}</text
			><CustomBox
				id="uiButton-normalClip"
				type="clip"
				image="uiButton-normalImage"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-hoverImage') || 'Hover Image' }}</text
			><CustomBox
				id="uiButton-hoverImage"
				type="file"
				filter="image"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-hoverClip') || 'Hover Clip' }}</text
			><CustomBox
				id="uiButton-hoverClip"
				type="clip"
				image="uiButton-hoverImage"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-activeImage') || 'Active Image' }}</text
			><CustomBox
				id="uiButton-activeImage"
				type="file"
				filter="image"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-activeClip') || 'Active Clip' }}</text
			><CustomBox
				id="uiButton-activeClip"
				type="clip"
				image="uiButton-activeImage"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-flip') || 'Flip' }}</text><SelectBox id="uiButton-flip"></SelectBox>
			<text>{{ local.getLabel('uiButton-border') || 'Border' }}</text
			><NumberBox
				id="uiButton-border"
				min="1"
				max="100"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiButton-imagePadding-box') || 'Padding' }}</text>
			<div class="flex-box" id="uiButton-imagePadding-box">
				<SliderBox
					id="uiButton-imagePadding-slider"
					min="0"
					max="20"
				></SliderBox>
				<NumberBox
					id="uiButton-imagePadding"
					min="0"
					max="100"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiButton-imageOpacity-box') || 'Opacity' }}</text>
			<div class="flex-box" id="uiButton-imageOpacity-box">
				<SliderBox
					id="uiButton-imageOpacity-slider"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="uiButton-imageOpacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiButton-imageEffect') || 'Effect' }}</text><SelectBox id="uiButton-imageEffect"></SelectBox>
			<text>{{ local.getLabel('uiButton-normalTint-box') || 'Normal Tint' }}</text>
			<box
				id="uiButton-normalTint-box"
				class="uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-normalTint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-normalTint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</box>
			<text>{{ local.getLabel('uiButton-hoverTint-box') || 'Hover Tint' }}</text>
			<box
				id="uiButton-hoverTint-box"
				class="uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-hoverTint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-hoverTint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</box>
			<text>{{ local.getLabel('uiButton-activeTint-box') || 'Active Tint' }}</text>
			<box
				id="uiButton-activeTint-box"
				class="uiElement-grid-box with-4-columns"
			>
				<NumberBox
					id="uiButton-activeTint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
				<NumberBox
					id="uiButton-activeTint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</box>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-text-properties-grid') || 'Text Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-text-properties-grid">
			<text>{{ local.getLabel('uiButton-direction') || 'Direction' }}</text><SelectBox id="uiButton-direction"></SelectBox>
			<text>{{ local.getLabel('uiButton-align-box') || 'Align' }}</text>
			<div class="flex-box" id="uiButton-align-box">
				<RadioBox
					id="uiButton-align-left"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><text>&#xf036;</text></RadioBox
				>
				<RadioBox
					id="uiButton-align-center"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><text>&#xf037;</text></RadioBox
				>
				<RadioBox
					id="uiButton-align-right"
					name="uiButton-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><text>&#xf038;</text></RadioBox
				>
				<RadioBox
					id="uiButton-align-top"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><text>&#xf036;</text></RadioBox
				>
				<RadioBox
					id="uiButton-align-middle"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><text>&#xf037;</text></RadioBox
				>
				<RadioBox
					id="uiButton-align-bottom"
					name="uiButton-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><text>&#xf038;</text></RadioBox
				>
			</div>
			<text>{{ local.getLabel('uiButton-content') || 'Content' }}</text
			><TextBox
				id="uiButton-content"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></TextBox>
			<text>{{ local.getLabel('uiButton-size-box') || 'Size' }}</text>
			<div class="flex-box" id="uiButton-size-box">
				<SliderBox
					id="uiButton-size-slider"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-size"
					min="10"
					max="400"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiButton-letterSpacing-box') || 'Letter Spacing' }}</text>
			<div class="flex-box" id="uiButton-letterSpacing-box">
				<SliderBox
					id="uiButton-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiButton-letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiButton-textPadding-box') || 'Padding' }}</text>
			<div class="flex-box" id="uiButton-textPadding-box">
				<SliderBox
					id="uiButton-textPadding-slider"
					min="0"
					max="40"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiButton-textPadding"
					min="0"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiButton-font') || 'Font' }}</text><TextBox id="uiButton-font"></TextBox>
			<text>{{ local.getLabel('uiButton-typeface') || 'Typeface' }}</text><SelectBox id="uiButton-typeface"></SelectBox>
			<text>{{ local.getLabel('uiButton-textEffect-type') || 'Effect' }}</text
			><SelectBox id="uiButton-textEffect-type"></SelectBox>
			<text>{{ local.getLabel('uiButton-textEffect-shadowOffsetX') || 'Shadow X' }}</text
			><NumberBox
				id="uiButton-textEffect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiButton-textEffect-shadowOffsetY') || 'Shadow Y' }}</text
			><NumberBox
				id="uiButton-textEffect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiButton-textEffect-strokeWidth') || 'Stroke Width' }}</text
			><NumberBox
				id="uiButton-textEffect-strokeWidth"
				min="1"
				max="20"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiButton-textEffect-color') || 'Effect Color' }}</text
			><ColorBox id="uiButton-textEffect-color"></ColorBox>
			<text>{{ local.getLabel('uiButton-normalColor') || 'Normal Color' }}</text
			><ColorBox id="uiButton-normalColor"></ColorBox>
			<text>{{ local.getLabel('uiButton-hoverColor') || 'Hover Color' }}</text><ColorBox id="uiButton-hoverColor"></ColorBox>
			<text>{{ local.getLabel('uiButton-activeColor') || 'Active Color' }}</text
			><ColorBox id="uiButton-activeColor"></ColorBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiButton-sound-effects-grid') || 'Sound Effects' }}</DetailSummary>
		<div class="detail-grid" id="uiButton-sound-effects-grid">
			<text>{{ local.getLabel('uiButton-hoverSound') || 'Hover SE' }}</text
			><CustomBox
				id="uiButton-hoverSound"
				type="file"
				filter="audio"
			></CustomBox>
			<text>{{ local.getLabel('uiButton-clickSound') || 'Click SE' }}</text
			><CustomBox
				id="uiButton-clickSound"
				type="file"
				filter="audio"
			></CustomBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
