<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneLight-general-grid">
			<div class="text">{{ local.getLabel('sceneLight-name') || 'Name' }}</div><TextBox id="sceneLight-name"></TextBox>
			<div class="text">{{ local.getLabel('sceneLight-type') || 'Type' }}</div><SelectBox id="sceneLight-type"></SelectBox>
			<div class="text">{{ local.getLabel('sceneLight-blend') || 'Blend' }}</div><SelectBox id="sceneLight-blend"></SelectBox>
			<div class="text">{{ local.getLabel('sceneLight-x') || 'X' }}</div
			><NumberBox
				id="sceneLight-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneLight-y') || 'Y' }}</div
			><NumberBox
				id="sceneLight-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneLight-range-box') || 'Range' }}</div>
			<div class="flex-box" id="sceneLight-range-box">
				<SliderBox
					id="sceneLight-range-slider"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-range"
					min="0"
					max="128"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-intensity-box') || 'Intensity' }}</div>
			<div class="flex-box" id="sceneLight-intensity-box">
				<SliderBox
					id="sceneLight-intensity-slider"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-intensity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-mask') || 'Mask' }}</div
			><CustomBox
				id="sceneLight-mask"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneLight-anchorX-box') || 'Anchor X' }}</div>
			<div class="flex-box" id="sceneLight-anchorX-box">
				<SliderBox
					id="sceneLight-anchorX-slider"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorX"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-anchorY-box') || 'Anchor Y' }}</div>
			<div class="flex-box" id="sceneLight-anchorY-box">
				<SliderBox
					id="sceneLight-anchorY-slider"
					min="0"
					max="1"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneLight-anchorY"
					min="0"
					max="1"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-width-box') || 'Width' }}</div>
			<div class="flex-box" id="sceneLight-width-box">
				<SliderBox
					id="sceneLight-width-slider"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-width"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-height-box') || 'Height' }}</div>
			<div class="flex-box" id="sceneLight-height-box">
				<SliderBox
					id="sceneLight-height-slider"
					min="1"
					max="40"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneLight-height"
					min="0"
					max="128"
					step="1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-angle-box') || 'Angle' }}</div>
			<div class="flex-box" id="sceneLight-angle-box">
				<SliderBox
					id="sceneLight-angle-slider"
					min="0"
					max="360"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-angle"
					min="-36000"
					max="36000"
					step="5"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-red-box') || 'Red' }}</div>
			<div class="flex-box" id="sceneLight-red-box">
				<SliderBox
					id="sceneLight-red-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-red"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-green-box') || 'Green' }}</div>
			<div class="flex-box" id="sceneLight-green-box">
				<SliderBox
					id="sceneLight-green-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-green"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-blue-box') || 'Blue' }}</div>
			<div class="flex-box" id="sceneLight-blue-box">
				<SliderBox
					id="sceneLight-blue-slider"
					min="0"
					max="255"
					step="5"
				></SliderBox>
				<NumberBox
					id="sceneLight-blue"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneLight-direct-box') || 'Direct Light Ratio' }}</div>
			<div class="flex-box" id="sceneLight-direct-box">
				<SliderBox
					id="sceneLight-direct-slider"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneLight-direct"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneLight-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneLight-events"
			class="inspector-list"
			filter="light"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneLight-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneLight-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneLight-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
