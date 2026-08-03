<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiDialogBox-properties-grid') || 'DialogBox Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiDialogBox-properties-grid">
			<text>{{ local.getLabel('uiDialogBox-content') || 'Content' }}</text
			><TextArea
				id="uiDialogBox-content"
				menu="tag-localization"
			></TextArea>
			<text>{{ local.getLabel('uiDialogBox-interval') || 'Print Interval' }}</text
			><NumberBox
				id="uiDialogBox-interval"
				min="0"
				max="100"
				decimals="4"
				unit="ms"
			></NumberBox>
			<text>{{ local.getLabel('uiDialogBox-size-box') || 'Size' }}</text>
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
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiDialogBox-lineSpacing-box') || 'Line Spacing' }}</text>
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
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiDialogBox-letterSpacing-box') || 'Letter Spacing' }}</text>
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
					unit="px"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiDialogBox-color') || 'Color' }}</text><ColorBox id="uiDialogBox-color"></ColorBox>
			<text>{{ local.getLabel('uiDialogBox-font') || 'Font' }}</text><TextBox id="uiDialogBox-font"></TextBox>
			<text>{{ local.getLabel('uiDialogBox-typeface') || 'Typeface' }}</text><SelectBox id="uiDialogBox-typeface"></SelectBox>
			<text>{{ local.getLabel('uiDialogBox-effect-type') || 'Effect' }}</text
			><SelectBox id="uiDialogBox-effect-type"></SelectBox>
			<text>{{ local.getLabel('uiDialogBox-effect-shadowOffsetX') || 'Shadow X' }}</text
			><NumberBox
				id="uiDialogBox-effect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiDialogBox-effect-shadowOffsetY') || 'Shadow Y' }}</text
			><NumberBox
				id="uiDialogBox-effect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiDialogBox-effect-strokeWidth') || 'Stroke Width' }}</text
			><NumberBox
				id="uiDialogBox-effect-strokeWidth"
				min="1"
				max="20"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiDialogBox-effect-color') || 'Effect Color' }}</text
			><ColorBox id="uiDialogBox-effect-color"></ColorBox> <text>{{ local.getLabel('uiDialogBox-blend') || 'Blend' }}</text
			><SelectBox id="uiDialogBox-blend"></SelectBox>
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
import NumberBox from '@app/components/common/NumberBox.vue';
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
