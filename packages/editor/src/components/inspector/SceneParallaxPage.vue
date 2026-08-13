<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-general-grid">
			<div class="text">{{ local.getLabel('sceneParallax-name') || 'Name' }}</div><TextBox id="sceneParallax-name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneParallax-image') || 'Image' }}</div
			><CustomBox
				id="sceneParallax-image" @input="onParamInput"
				type="file"
				filter="image"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneParallax-layer') || 'Layer' }}</div><SelectBox id="sceneParallax-layer" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('sceneParallax-order') || 'Order' }}</div
			><NumberBox id="sceneParallax-order" @input="onParamInput" min="0" max="100"></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-light') || 'Light Sampling' }}</div
			><SelectBox id="sceneParallax-light" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('sceneParallax-blend') || 'Blend' }}</div
			><SelectBox id="sceneParallax-blend" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('sceneParallax-opacity') || 'Opacity' }}</div
			><NumberBox
				id="sceneParallax-opacity" @input="onParamInput"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-x') || 'X' }}</div
			><NumberBox
				id="sceneParallax-x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-y') || 'Y' }}</div
			><NumberBox
				id="sceneParallax-y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-parallax-grid') || 'Parallax' }}</DetailSummary>
		<div class="detail-grid" id="sceneParallax-parallax-grid">
			<div class="text">{{ local.getLabel('sceneParallax-scaleX') || 'Scale X' }}</div
			><NumberBox
				id="sceneParallax-scaleX" @input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-scaleY') || 'Scale Y' }}</div
			><NumberBox
				id="sceneParallax-scaleY" @input="onParamInput"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-repeatX') || 'Repeat X' }}</div
			><NumberBox id="sceneParallax-repeatX" @input="onParamInput" min="1" max="100"></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-repeatY') || 'Repeat Y' }}</div
			><NumberBox id="sceneParallax-repeatY" @input="onParamInput" min="1" max="100"></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-anchorX') || 'Anchor X' }}</div
			><NumberBox
				id="sceneParallax-anchorX" @input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-anchorY') || 'Anchor Y' }}</div
			><NumberBox
				id="sceneParallax-anchorY" @input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-offsetX') || 'Offset X' }}</div
			><NumberBox
				id="sceneParallax-offsetX" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-offsetY') || 'Offset Y' }}</div
			><NumberBox
				id="sceneParallax-offsetY" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-parallaxFactorX') || 'Parallax Factor X' }}</div
			><NumberBox
				id="sceneParallax-parallaxFactorX" @input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-parallaxFactorY') || 'Parallax Factor Y' }}</div
			><NumberBox
				id="sceneParallax-parallaxFactorY" @input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-shiftSpeedX') || 'Shift Speed X' }}</div
			><NumberBox
				id="sceneParallax-shiftSpeedX" @input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-shiftSpeedY') || 'Shift Speed Y' }}</div
			><NumberBox
				id="sceneParallax-shiftSpeedY" @input="onParamInput"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneParallax-tint-0-box') || 'Tint - Red' }}</div>
			<div class="flex-box" id="sceneParallax-tint-0-box">
				<SliderBox
					id="sceneParallax-tint-0-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-0" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParallax-tint-1-box') || 'Tint - Green' }}</div>
			<div class="flex-box" id="sceneParallax-tint-1-box">
				<SliderBox
					id="sceneParallax-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-1" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParallax-tint-2-box') || 'Tint - Blue' }}</div>
			<div class="flex-box" id="sceneParallax-tint-2-box">
				<SliderBox
					id="sceneParallax-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-2" @input="onParamInput"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneParallax-tint-3-box') || 'Tint - Grayscale' }}</div>
			<div class="flex-box" id="sceneParallax-tint-3-box">
				<SliderBox
					id="sceneParallax-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-3" @input="onParamInput"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneParallax-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneParallax-events"
			class="inspector-list"
			filter="parallax"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneParallax-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneParallax-parameter-pane"></ParameterPane>
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
	Inspector?.sceneParallax?.paramInput?.({ target });
};

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
