<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneTilemap-general-grid">
			<div class="text">{{ local.getLabel('sceneTilemap-name') || 'Name' }}</div><TextBox id="sceneTilemap-name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneTilemap-layer') || 'Layer' }}</div><SelectBox id="sceneTilemap-layer" @input="onParamInput" @write="onLayerWrite"></SelectBox>
			<div class="text">{{ local.getLabel('sceneTilemap-order') || 'Order' }}</div
			><NumberBox id="sceneTilemap-order" @input="onParamInput" min="0" max="100"></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-light') || 'Light Sampling' }}</div
			><SelectBox id="sceneTilemap-light" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('sceneTilemap-blend') || 'Blend' }}</div
			><SelectBox id="sceneTilemap-blend" @input="onParamInput"></SelectBox> <div class="text">{{ local.getLabel('sceneTilemap-x') || 'X' }}</div
			><NumberBox
				id="sceneTilemap-x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-y') || 'Y' }}</div
			><NumberBox
				id="sceneTilemap-y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-width') || 'Width' }}</div
			><NumberBox
				id="sceneTilemap-width"
				min="0"
				max="512"
				unit="tile"
				@change="onParamChange"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-height') || 'Height' }}</div
			><NumberBox
				id="sceneTilemap-height"
				min="0"
				max="512"
				unit="tile"
				@change="onParamChange"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-anchorX') || 'Anchor X' }}</div
			><NumberBox
				id="sceneTilemap-anchorX" @input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-anchorY') || 'Anchor Y' }}</div
			><NumberBox
				id="sceneTilemap-anchorY" @input="onParamInput"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-offsetX') || 'Offset X' }}</div
			><NumberBox
				id="sceneTilemap-offsetX" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-offsetY') || 'Offset Y' }}</div
			><NumberBox
				id="sceneTilemap-offsetY" @input="onParamInput"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-parallaxFactorX') || 'Parallax Factor X' }}</div
			><NumberBox
				id="sceneTilemap-parallaxFactorX" @input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-parallaxFactorY') || 'Parallax Factor Y' }}</div
			><NumberBox
				id="sceneTilemap-parallaxFactorY" @input="onParamInput"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneTilemap-opacity') || 'Opacity' }}</div
			><NumberBox
				id="sceneTilemap-opacity" @input="onParamInput"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneTilemap-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneTilemap-events"
			class="inspector-list"
			filter="tilemap"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneTilemap-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneTilemap-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const scene = useSceneStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.sceneTilemap?.paramInput?.({ target });
};
const onParamChange = () => {
	Inspector?.sceneTilemap?.paramInput?.();
};
const onLayerWrite = (value: unknown) => {
	Inspector?.sceneTilemap?.layerWrite?.({ value });
};

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
