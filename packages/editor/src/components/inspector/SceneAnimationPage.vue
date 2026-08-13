<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneAnimation-general-grid">
			<div class="text">{{ local.getLabel('sceneAnimation-name') || 'Name' }}</div><TextBox id="sceneAnimation-name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneAnimation-animationId') || 'Animation' }}</div
			><CustomBox
				id="sceneAnimation-animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneAnimation-motion') || 'Motion' }}</div><SelectBox id="sceneAnimation-motion" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('sceneAnimation-rotatable') || 'Rotatable' }}</div
			><SelectBox id="sceneAnimation-rotatable" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('sceneAnimation-x') || 'X' }}</div
			><NumberBox
				id="sceneAnimation-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneAnimation-y') || 'Y' }}</div
			><NumberBox
				id="sceneAnimation-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneAnimation-angle-box') || 'Angle' }}</div
			><div class="flex-box" id="sceneAnimation-angle-box">
				<SliderBox
					id="sceneAnimation-angle-slider"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-scale-box') || 'Scale' }}</div
			><div class="flex-box" id="sceneAnimation-scale-box">
				<SliderBox
					id="sceneAnimation-scale-slider"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-speed-box') || 'Speed' }}</div
			><div class="flex-box" id="sceneAnimation-speed-box">
				<SliderBox
					id="sceneAnimation-speed-slider"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-opacity-box') || 'Opacity' }}</div
			><div class="flex-box" id="sceneAnimation-opacity-box">
				<SliderBox
					id="sceneAnimation-opacity-slider"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneAnimation-priority-box') || 'Priority' }}</div
			><div class="flex-box" id="sceneAnimation-priority-box">
				<SliderBox
					id="sceneAnimation-priority-slider"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneAnimation-priority"
					min="-512"
					max="512"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-events"
			class="inspector-list"
			filter="animation"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneAnimation-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneAnimation-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneAnimation-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
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

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.sceneAnimation?.paramInput?.({ target });
};

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
