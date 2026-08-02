<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiText-properties-grid') || 'Text Properties' }}</DetailSummary>
		<detail-grid id="uiText-properties-grid">
			<text>{{ local.getLabel('uiText-direction') || 'Direction' }}</text><SelectBox id="uiText-direction"></SelectBox>
			<text>{{ local.getLabel('uiText-align-box') || 'Align' }}</text>
			<flex-box id="uiText-align-box">
				<RadioBox
					id="uiText-align-left"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><text>&#xf036;</text></RadioBox
				>
				<RadioBox
					id="uiText-align-center"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><text>&#xf037;</text></RadioBox
				>
				<RadioBox
					id="uiText-align-right"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><text>&#xf038;</text></RadioBox
				>
				<RadioBox
					id="uiText-align-top"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><text>&#xf036;</text></RadioBox
				>
				<RadioBox
					id="uiText-align-middle"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><text>&#xf037;</text></RadioBox
				>
				<RadioBox
					id="uiText-align-bottom"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><text>&#xf038;</text></RadioBox
				>
			</flex-box>
			<text>{{ local.getLabel('uiText-content') || 'Content' }}</text
			><TextArea
				id="uiText-content"
				menu="tag-global-var tag-dynamic-global-var tag-localization"
			></TextArea>
			<text>{{ local.getLabel('uiText-size-box') || 'Size' }}</text>
			<flex-box id="uiText-size-box">
				<SliderBox
					id="uiText-size-slider"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiText-size"
					min="10"
					max="400"
					step="1"
					unit="px"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('uiText-lineSpacing-box') || 'Line Spacing' }}</text>
			<flex-box id="uiText-lineSpacing-box">
				<SliderBox
					id="uiText-lineSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiText-lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('uiText-letterSpacing-box') || 'Letter Spacing' }}</text>
			<flex-box id="uiText-letterSpacing-box">
				<SliderBox
					id="uiText-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiText-letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('uiText-color') || 'Color' }}</text><ColorBox id="uiText-color"></ColorBox>
			<text>{{ local.getLabel('uiText-font') || 'Font' }}</text><TextBox id="uiText-font"></TextBox>
			<text>{{ local.getLabel('uiText-typeface') || 'Typeface' }}</text><SelectBox id="uiText-typeface"></SelectBox>
			<text>{{ local.getLabel('uiText-effect-type') || 'Effect' }}</text><SelectBox id="uiText-effect-type"></SelectBox>
			<text>{{ local.getLabel('uiText-effect-shadowOffsetX') || 'Shadow X' }}</text
			><NumberBox
				id="uiText-effect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiText-effect-shadowOffsetY') || 'Shadow Y' }}</text
			><NumberBox
				id="uiText-effect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiText-effect-strokeWidth') || 'Stroke Width' }}</text
			><NumberBox
				id="uiText-effect-strokeWidth"
				min="1"
				max="20"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiText-effect-color') || 'Effect Color' }}</text
			><ColorBox id="uiText-effect-color"></ColorBox> <text>{{ local.getLabel('uiText-overflow') || 'Overflow' }}</text
			><SelectBox id="uiText-overflow"></SelectBox> <text>{{ local.getLabel('uiText-blend') || 'Blend' }}</text
			><SelectBox id="uiText-blend"></SelectBox>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import RadioBox from '@app/components/common/RadioBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
