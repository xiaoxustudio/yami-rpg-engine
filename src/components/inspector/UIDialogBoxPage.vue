<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiDialogBox-properties-grid') || 'DialogBox Properties' }}</DetailSummary>
		<detail-grid id="uiDialogBox-properties-grid">
			<text>{{ local.getLabel('uiDialogBox-content') || 'Content' }}</text
			><text-area
				id="uiDialogBox-content"
				menu="tag-localization"
			></text-area>
			<text>{{ local.getLabel('uiDialogBox-interval') || 'Print Interval' }}</text
			><number-box
				id="uiDialogBox-interval"
				min="0"
				max="100"
				decimals="4"
				unit="ms"
			></number-box>
			<text>{{ local.getLabel('uiDialogBox-size-box') || 'Size' }}</text>
			<flex-box id="uiDialogBox-size-box">
				<slider-box
					id="uiDialogBox-size-slider"
					min="12"
					max="52"
					step="2"
				></slider-box>
				<number-box
					id="uiDialogBox-size"
					min="10"
					max="400"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiDialogBox-lineSpacing-box') || 'Line Spacing' }}</text>
			<flex-box id="uiDialogBox-lineSpacing-box">
				<slider-box
					id="uiDialogBox-lineSpacing-slider"
					min="0"
					max="20"
					step="1"
				></slider-box>
				<number-box
					id="uiDialogBox-lineSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiDialogBox-letterSpacing-box') || 'Letter Spacing' }}</text>
			<flex-box id="uiDialogBox-letterSpacing-box">
				<slider-box
					id="uiDialogBox-letterSpacing-slider"
					min="0"
					max="20"
					step="1"
				></slider-box>
				<number-box
					id="uiDialogBox-letterSpacing"
					min="-10"
					max="100"
					step="1"
					unit="px"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiDialogBox-color') || 'Color' }}</text><color-box id="uiDialogBox-color"></color-box>
			<text>{{ local.getLabel('uiDialogBox-font') || 'Font' }}</text><text-box id="uiDialogBox-font"></text-box>
			<text>{{ local.getLabel('uiDialogBox-typeface') || 'Typeface' }}</text><select-box id="uiDialogBox-typeface"></select-box>
			<text>{{ local.getLabel('uiDialogBox-effect-type') || 'Effect' }}</text
			><select-box id="uiDialogBox-effect-type"></select-box>
			<text>{{ local.getLabel('uiDialogBox-effect-shadowOffsetX') || 'Shadow X' }}</text
			><number-box
				id="uiDialogBox-effect-shadowOffsetX"
				min="-9"
				max="9"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiDialogBox-effect-shadowOffsetY') || 'Shadow Y' }}</text
			><number-box
				id="uiDialogBox-effect-shadowOffsetY"
				min="-9"
				max="9"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiDialogBox-effect-strokeWidth') || 'Stroke Width' }}</text
			><number-box
				id="uiDialogBox-effect-strokeWidth"
				min="1"
				max="20"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiDialogBox-effect-color') || 'Effect Color' }}</text
			><color-box id="uiDialogBox-effect-color"></color-box> <text>{{ local.getLabel('uiDialogBox-blend') || 'Blend' }}</text
			><select-box id="uiDialogBox-blend"></select-box>
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
