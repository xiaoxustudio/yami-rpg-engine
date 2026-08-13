<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParticle-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneParticle-general-grid">
			<div class="text">{{ local.getLabel('sceneParticle-name') || 'Name' }}</div><TextBox id="sceneParticle-name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneParticle-particleId') || 'Particle' }}</div
			><CustomBox
				id="sceneParticle-particleId" @input="onParamInput"
				type="file"
				filter="particle"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneParticle-x') || 'X' }}</div
			><NumberBox
				id="sceneParticle-x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParticle-y') || 'Y' }}</div
			><NumberBox
				id="sceneParticle-y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParticle-angle-box') || 'Angle' }}</div
			><div class="flex-box" id="sceneParticle-angle-box">
				<SliderBox
					id="sceneParticle-angle-slider"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneParticle-angle" @input="onParamInput"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParticle-scale-box') || 'Scale' }}</div
			><div class="flex-box" id="sceneParticle-scale-box">
				<SliderBox
					id="sceneParticle-scale-slider"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-scale" @input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParticle-speed-box') || 'Speed' }}</div
			><div class="flex-box" id="sceneParticle-speed-box">
				<SliderBox
					id="sceneParticle-speed-slider"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-speed" @input="onParamInput"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParticle-opacity-box') || 'Opacity' }}</div
			><div class="flex-box" id="sceneParticle-opacity-box">
				<SliderBox
					id="sceneParticle-opacity-slider"
					min="0"
					max="1"
					step="0.05"
				></SliderBox>
				<NumberBox
					id="sceneParticle-opacity" @input="onParamInput"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParticle-priority-box') || 'Priority' }}</div
			><div class="flex-box" id="sceneParticle-priority-box">
				<SliderBox
					id="sceneParticle-priority-slider"
					min="-4"
					max="4"
					step="1"
				></SliderBox>
				<NumberBox
					id="sceneParticle-priority" @input="onParamInput"
					min="-512"
					max="512"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParticle-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneParticle-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParticle-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParticle-events"
			class="inspector-list"
			filter="particle"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParticle-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneParticle-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneParticle-parameter-pane"></ParameterPane>
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

const scene = useSceneStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.sceneParticle?.paramInput?.({ target });
};

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
