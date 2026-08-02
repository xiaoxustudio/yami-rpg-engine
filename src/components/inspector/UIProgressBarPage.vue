<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiProgressBar-properties-grid') || 'ProgressBar Properties' }}</DetailSummary>
		<detail-grid id="uiProgressBar-properties-grid">
			<text>{{ local.getLabel('uiProgressBar-image') || 'Image' }}</text
			><custom-box
				id="uiProgressBar-image"
				type="file"
				filter="image"
			></custom-box>
			<text>{{ local.getLabel('uiProgressBar-display') || 'Display' }}</text><select-box id="uiProgressBar-display"></select-box>
			<text>{{ local.getLabel('uiProgressBar-clip') || 'Clip' }}</text
			><custom-box
				id="uiProgressBar-clip"
				type="clip"
				image="uiProgressBar-image"
			></custom-box>
			<text>{{ local.getLabel('uiProgressBar-type') || 'Type' }}</text><select-box id="uiProgressBar-type"></select-box>
			<text>{{ local.getLabel('uiProgressBar-centerX') || 'Center X' }}</text
			><number-box
				id="uiProgressBar-centerX"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('uiProgressBar-centerY') || 'Center Y' }}</text
			><number-box
				id="uiProgressBar-centerY"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('uiProgressBar-startAngle') || 'Start Angle' }}</text
			><number-box
				id="uiProgressBar-startAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg"
			></number-box>
			<text>{{ local.getLabel('uiProgressBar-centralAngle') || 'Central Angle' }}</text
			><number-box
				id="uiProgressBar-centralAngle"
				min="-360"
				max="360"
				step="5"
				decimals="4"
				unit="deg"
			></number-box>
			<text>{{ local.getLabel('uiProgressBar-step') || 'Step' }}</text
			><number-box id="uiProgressBar-step" min="0" max="100"></number-box>
			<text>{{ local.getLabel('uiProgressBar-progress') || 'Progress' }}</text
			><number-box
				id="uiProgressBar-progress"
				min="0"
				max="1"
				step="0.01"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('uiProgressBar-blend') || 'Blend' }}</text><select-box id="uiProgressBar-blend"></select-box>
			<text>{{ local.getLabel('uiProgressBar-colorMode') || 'Color Mode' }}</text
			><select-box id="uiProgressBar-colorMode"></select-box>
			<text>{{ local.getLabel('uiProgressBar-color-0-box') || 'Red' }}</text>
			<flex-box id="uiProgressBar-color-0-box">
				<slider-box
					id="uiProgressBar-color-0-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="uiProgressBar-color-0"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiProgressBar-color-1-box') || 'Green' }}</text>
			<flex-box id="uiProgressBar-color-1-box">
				<slider-box
					id="uiProgressBar-color-1-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="uiProgressBar-color-1"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiProgressBar-color-2-box') || 'Blue' }}</text>
			<flex-box id="uiProgressBar-color-2-box">
				<slider-box
					id="uiProgressBar-color-2-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="uiProgressBar-color-2"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('uiProgressBar-color-3-box') || 'Alpha' }}</text>
			<flex-box id="uiProgressBar-color-3-box">
				<slider-box
					id="uiProgressBar-color-3-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="uiProgressBar-color-3"
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
