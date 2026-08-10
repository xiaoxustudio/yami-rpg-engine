<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiText-properties-grid') || 'Text Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiText-properties-grid">
			<div class="text">{{ local.getLabel('uiText-direction') || 'Direction' }}</div><SelectBox id="uiText-direction" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiText-align-box') || 'Align' }}</div>
			<div class="flex-box" id="uiText-align-box">
				<RadioBox
					id="uiText-align-left"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="left"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-center"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="center"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-right"
					name="uiText-horizontalAlign"
					class="uiText-align"
					value="right"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-top"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="top"
					tabindex="0"
					><div class="text">&#xf036;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-middle"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="middle"
					tabindex="0"
					><div class="text">&#xf037;</div></RadioBox
				>
				<RadioBox
					id="uiText-align-bottom"
					name="uiText-verticalAlign"
					class="uiText-align rotated"
					value="bottom"
					tabindex="0"
					><div class="text">&#xf038;</div></RadioBox
				>
			</div>
			<div class="text">{{ local.getLabel('uiText-content') || 'Content' }}</div
			><TextArea
				id="uiText-content"
				menu="tag-global-var tag-dynamic-global-var tag-localization" @input="onParamInput"
			></TextArea>
			<div class="text">{{ local.getLabel('uiText-size-box') || 'Size' }}</div>
			<div class="flex-box" id="uiText-size-box">
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
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiText-lineSpacing-box') || 'Line Spacing' }}</div>
			<div class="flex-box" id="uiText-lineSpacing-box">
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
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiText-letterSpacing-box') || 'Letter Spacing' }}</div>
			<div class="flex-box" id="uiText-letterSpacing-box">
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
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiText-color') || 'Color' }}</div><ColorBox id="uiText-color" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiText-font') || 'Font' }}</div><TextBox id="uiText-font" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiText-typeface') || 'Typeface' }}</div><SelectBox id="uiText-typeface" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiText-effect-type') || 'Effect' }}</div><SelectBox id="uiText-effect-type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiText-effect-shadowOffsetX') || 'Shadow X' }}</div
			><NumberBox
				id="uiText-effect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiText-effect-shadowOffsetY') || 'Shadow Y' }}</div
			><NumberBox
				id="uiText-effect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiText-effect-strokeWidth') || 'Stroke Width' }}</div
			><NumberBox
				id="uiText-effect-strokeWidth"
				min="1"
				max="20"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiText-effect-color') || 'Effect Color' }}</div
			><ColorBox id="uiText-effect-color" @input="onParamInput"></ColorBox> <div class="text">{{ local.getLabel('uiText-overflow') || 'Overflow' }}</div
			><SelectBox id="uiText-overflow" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('uiText-blend') || 'Blend' }}</div
			><SelectBox id="uiText-blend" @input="onParamInput"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
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
const onParamInput = (event: any) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.uiElement?.paramInput?.({ target });
};

const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
