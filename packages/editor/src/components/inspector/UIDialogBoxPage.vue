<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiDialogBox-properties-grid') || 'DialogBox Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiDialogBox-properties-grid">
			<div class="text">{{ local.getLabel('uiDialogBox-content') || 'Content' }}</div
			><TextArea
				id="uiDialogBox-content"
				menu="tag-localization" @input="onParamInput"
			></TextArea>
			<div class="text">{{ local.getLabel('uiDialogBox-interval') || 'Print Interval' }}</div
			><NumberBox
				id="uiDialogBox-interval"
				min="0"
				max="100"
				decimals="4"
				unit="ms" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiDialogBox-size-box') || 'Size' }}</div>
			<div class="flex-box" id="uiDialogBox-size-box">
				<SliderBox
					id="uiDialogBox-size-slider"
					min="12"
					max="52"
					step="2"
				></SliderBox>
				<NumberBox
					id="uiDialogBox-size"
					min="10"
					max="400"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiDialogBox-lineSpacing-box') || 'Line Spacing' }}</div>
			<div class="flex-box" id="uiDialogBox-lineSpacing-box">
				<SliderBox
					id="uiDialogBox-lineSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiDialogBox-lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiDialogBox-letterSpacing-box') || 'Letter Spacing' }}</div>
			<div class="flex-box" id="uiDialogBox-letterSpacing-box">
				<SliderBox
					id="uiDialogBox-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></SliderBox>
				<NumberBox
					id="uiDialogBox-letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px" @input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('uiDialogBox-color') || 'Color' }}</div><ColorBox id="uiDialogBox-color" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('uiDialogBox-font') || 'Font' }}</div><TextBox id="uiDialogBox-font" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('uiDialogBox-typeface') || 'Typeface' }}</div><SelectBox id="uiDialogBox-typeface" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiDialogBox-effect-type') || 'Effect' }}</div
			><SelectBox id="uiDialogBox-effect-type" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('uiDialogBox-effect-shadowOffsetX') || 'Shadow X' }}</div
			><NumberBox
				id="uiDialogBox-effect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiDialogBox-effect-shadowOffsetY') || 'Shadow Y' }}</div
			><NumberBox
				id="uiDialogBox-effect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiDialogBox-effect-strokeWidth') || 'Stroke Width' }}</div
			><NumberBox
				id="uiDialogBox-effect-strokeWidth"
				min="1"
				max="20"
				unit="px" @input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiDialogBox-effect-color') || 'Effect Color' }}</div
			><ColorBox id="uiDialogBox-effect-color" @input="onParamInput"></ColorBox> <div class="text">{{ local.getLabel('uiDialogBox-blend') || 'Blend' }}</div
			><SelectBox id="uiDialogBox-blend" @input="onParamInput"></SelectBox>
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
