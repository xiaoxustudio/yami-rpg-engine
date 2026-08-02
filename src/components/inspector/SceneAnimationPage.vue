<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneAnimation-general-grid">
			<text>{{ local.getLabel('sceneAnimation-name') || 'Name' }}</text><text-box id="sceneAnimation-name"></text-box>
			<text>{{ local.getLabel('sceneAnimation-animationId') || 'Animation' }}</text
			><custom-box
				id="sceneAnimation-animationId"
				type="file"
				filter="animation"
			></custom-box>
			<text>{{ local.getLabel('sceneAnimation-motion') || 'Motion' }}</text><select-box id="sceneAnimation-motion"></select-box>
			<text>{{ local.getLabel('sceneAnimation-rotatable') || 'Rotatable' }}</text
			><select-box id="sceneAnimation-rotatable"></select-box> <text>{{ local.getLabel('sceneAnimation-x') || 'X' }}</text
			><number-box
				id="sceneAnimation-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></number-box>
			<text>{{ local.getLabel('sceneAnimation-y') || 'Y' }}</text
			><number-box
				id="sceneAnimation-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></number-box>
			<text>{{ local.getLabel('sceneAnimation-angle-box') || 'Angle' }}</text
			><flex-box id="sceneAnimation-angle-box">
				<slider-box
					id="sceneAnimation-angle-slider"
					min="0"
					max="360"
					step="45"
				></slider-box>
				<number-box
					id="sceneAnimation-angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneAnimation-scale-box') || 'Scale' }}</text
			><flex-box id="sceneAnimation-scale-box">
				<slider-box
					id="sceneAnimation-scale-slider"
					min="0"
					max="2"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneAnimation-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneAnimation-speed-box') || 'Speed' }}</text
			><flex-box id="sceneAnimation-speed-box">
				<slider-box
					id="sceneAnimation-speed-slider"
					min="0"
					max="2"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneAnimation-speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneAnimation-opacity-box') || 'Opacity' }}</text
			><flex-box id="sceneAnimation-opacity-box">
				<slider-box
					id="sceneAnimation-opacity-slider"
					min="0"
					max="1"
					step="0.05"
				></slider-box>
				<number-box
					id="sceneAnimation-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneAnimation-priority-box') || 'Priority' }}</text
			><flex-box id="sceneAnimation-priority-box">
				<slider-box
					id="sceneAnimation-priority-slider"
					min="-4"
					max="4"
					step="1"
				></slider-box>
				<number-box
					id="sceneAnimation-priority"
					min="-512"
					max="512"
				></number-box>
			</flex-box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-conditions') || 'Conditions' }}</DetailSummary>
		<param-list
			id="sceneAnimation-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-events') || 'Events' }}</DetailSummary>
		<param-list
			id="sceneAnimation-events"
			class="inspector-list"
			filter="animation"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="sceneAnimation-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<parameter-pane id="sceneAnimation-parameter-pane"></parameter-pane>
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
