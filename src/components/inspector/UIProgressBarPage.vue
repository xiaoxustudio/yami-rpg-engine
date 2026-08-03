<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiProgressBar-properties-grid') || 'ProgressBar Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiProgressBar-properties-grid">
			<text>{{ local.getLabel('uiProgressBar-image') || 'Image' }}</text
			><CustomBox
				id="uiProgressBar-image"
				type="file"
				filter="image"
			></CustomBox>
			<text>{{ local.getLabel('uiProgressBar-display') || 'Display' }}</text><SelectBox id="uiProgressBar-display"></SelectBox>
			<text>{{ local.getLabel('uiProgressBar-clip') || 'Clip' }}</text
			><CustomBox
				id="uiProgressBar-clip"
				type="clip"
				image="uiProgressBar-image"
			></CustomBox>
			<text>{{ local.getLabel('uiProgressBar-type') || 'Type' }}</text><SelectBox id="uiProgressBar-type"></SelectBox>
			<text>{{ local.getLabel('uiProgressBar-centerX') || 'Center X' }}</text
			><NumberBox
				id="uiProgressBar-centerX"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('uiProgressBar-centerY') || 'Center Y' }}</text
			><NumberBox
				id="uiProgressBar-centerY"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('uiProgressBar-startAngle') || 'Start Angle' }}</text
			><NumberBox
				id="uiProgressBar-startAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg"
			></NumberBox>
			<text>{{ local.getLabel('uiProgressBar-centralAngle') || 'Central Angle' }}</text
			><NumberBox
				id="uiProgressBar-centralAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg"
			></NumberBox>
			<text>{{ local.getLabel('uiProgressBar-step') || 'Step' }}</text
			><NumberBox id="uiProgressBar-step" min="0" max="100"></NumberBox>
			<text>{{ local.getLabel('uiProgressBar-progress') || 'Progress' }}</text
			><NumberBox
				id="uiProgressBar-progress"
				min="0"
				max="1"
				step="0.01"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('uiProgressBar-blend') || 'Blend' }}</text><SelectBox id="uiProgressBar-blend"></SelectBox>
			<text>{{ local.getLabel('uiProgressBar-colorMode') || 'Color Mode' }}</text
			><SelectBox id="uiProgressBar-colorMode"></SelectBox>
			<text>{{ local.getLabel('uiProgressBar-color-0-box') || 'Red' }}</text>
			<div class="flex-box" id="uiProgressBar-color-0-box">
				<SliderBox
					id="uiProgressBar-color-0-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-0"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiProgressBar-color-1-box') || 'Green' }}</text>
			<div class="flex-box" id="uiProgressBar-color-1-box">
				<SliderBox
					id="uiProgressBar-color-1-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-1"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiProgressBar-color-2-box') || 'Blue' }}</text>
			<div class="flex-box" id="uiProgressBar-color-2-box">
				<SliderBox
					id="uiProgressBar-color-2-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-2"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<text>{{ local.getLabel('uiProgressBar-color-3-box') || 'Alpha' }}</text>
			<div class="flex-box" id="uiProgressBar-color-3-box">
				<SliderBox
					id="uiProgressBar-color-3-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="uiProgressBar-color-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
