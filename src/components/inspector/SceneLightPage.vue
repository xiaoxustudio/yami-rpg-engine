<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneLight-general-grid">
			<text>{{ local.getLabel('sceneLight-name') || 'Name' }}</text><text-box id="sceneLight-name"></text-box>
			<text>{{ local.getLabel('sceneLight-type') || 'Type' }}</text><select-box id="sceneLight-type"></select-box>
			<text>{{ local.getLabel('sceneLight-blend') || 'Blend' }}</text><select-box id="sceneLight-blend"></select-box>
			<text>{{ local.getLabel('sceneLight-x') || 'X' }}</text
			><number-box
				id="sceneLight-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneLight-y') || 'Y' }}</text
			><number-box
				id="sceneLight-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneLight-range-box') || 'Range' }}</text>
			<flex-box id="sceneLight-range-box">
				<slider-box
					id="sceneLight-range-slider"
					min="1"
					max="40"
					step="1"
				></slider-box>
				<number-box
					id="sceneLight-range"
					min="0"
					max="128"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-intensity-box') || 'Intensity' }}</text>
			<flex-box id="sceneLight-intensity-box">
				<slider-box
					id="sceneLight-intensity-slider"
					min="0"
					max="1"
					step="0.05"
				></slider-box>
				<number-box
					id="sceneLight-intensity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-mask') || 'Mask' }}</text
			><custom-box
				id="sceneLight-mask"
				type="file"
				filter="image"
			></custom-box>
			<text>{{ local.getLabel('sceneLight-anchorX-box') || 'Anchor X' }}</text>
			<flex-box id="sceneLight-anchorX-box">
				<slider-box
					id="sceneLight-anchorX-slider"
					min="0"
					max="1"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneLight-anchorX"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-anchorY-box') || 'Anchor Y' }}</text>
			<flex-box id="sceneLight-anchorY-box">
				<slider-box
					id="sceneLight-anchorY-slider"
					min="0"
					max="1"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneLight-anchorY"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-width-box') || 'Width' }}</text>
			<flex-box id="sceneLight-width-box">
				<slider-box
					id="sceneLight-width-slider"
					min="1"
					max="40"
					step="1"
				></slider-box>
				<number-box
					id="sceneLight-width"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-height-box') || 'Height' }}</text>
			<flex-box id="sceneLight-height-box">
				<slider-box
					id="sceneLight-height-slider"
					min="1"
					max="40"
					step="1"
				></slider-box>
				<number-box
					id="sceneLight-height"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-angle-box') || 'Angle' }}</text>
			<flex-box id="sceneLight-angle-box">
				<slider-box
					id="sceneLight-angle-slider"
					min="0"
					max="360"
					step="5"
				></slider-box>
				<number-box
					id="sceneLight-angle"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-red-box') || 'Red' }}</text>
			<flex-box id="sceneLight-red-box">
				<slider-box
					id="sceneLight-red-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="sceneLight-red"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-green-box') || 'Green' }}</text>
			<flex-box id="sceneLight-green-box">
				<slider-box
					id="sceneLight-green-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="sceneLight-green"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-blue-box') || 'Blue' }}</text>
			<flex-box id="sceneLight-blue-box">
				<slider-box
					id="sceneLight-blue-slider"
					min="0"
					max="255"
					step="5"
				></slider-box>
				<number-box
					id="sceneLight-blue"
					min="0"
					max="255"
					step="5"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneLight-direct-box') || 'Direct Light Ratio' }}</text>
			<flex-box id="sceneLight-direct-box">
				<slider-box
					id="sceneLight-direct-slider"
					min="0"
					max="1"
					step="0.05"
				></slider-box>
				<number-box
					id="sceneLight-direct"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</flex-box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-conditions') || 'Conditions' }}</DetailSummary>
		<param-list
			id="sceneLight-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-events') || 'Events' }}</DetailSummary>
		<param-list
			id="sceneLight-events"
			class="inspector-list"
			filter="light"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="sceneLight-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<parameter-pane id="sceneLight-parameter-pane"></parameter-pane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
