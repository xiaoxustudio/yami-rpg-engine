<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneParallax-general-grid">
			<text>{{ local.getLabel('sceneParallax-name') || 'Name' }}</text><TextBox id="sceneParallax-name"></TextBox>
			<text>{{ local.getLabel('sceneParallax-image') || 'Image' }}</text
			><CustomBox
				id="sceneParallax-image"
				type="file"
				filter="image"
			></CustomBox>
			<text>{{ local.getLabel('sceneParallax-layer') || 'Layer' }}</text><SelectBox id="sceneParallax-layer"></SelectBox>
			<text>{{ local.getLabel('sceneParallax-order') || 'Order' }}</text
			><NumberBox id="sceneParallax-order" min="0" max="100"></NumberBox>
			<text>{{ local.getLabel('sceneParallax-light') || 'Light Sampling' }}</text
			><SelectBox id="sceneParallax-light"></SelectBox> <text>{{ local.getLabel('sceneParallax-blend') || 'Blend' }}</text
			><SelectBox id="sceneParallax-blend"></SelectBox> <text>{{ local.getLabel('sceneParallax-opacity') || 'Opacity' }}</text
			><NumberBox
				id="sceneParallax-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-x') || 'X' }}</text
			><NumberBox
				id="sceneParallax-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-y') || 'Y' }}</text
			><NumberBox
				id="sceneParallax-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneParallax-parallax-grid') || 'Parallax' }}</DetailSummary>
		<detail-grid id="sceneParallax-parallax-grid">
			<text>{{ local.getLabel('sceneParallax-scaleX') || 'Scale X' }}</text
			><NumberBox
				id="sceneParallax-scaleX"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-scaleY') || 'Scale Y' }}</text
			><NumberBox
				id="sceneParallax-scaleY"
				min="0.2"
				max="32"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-repeatX') || 'Repeat X' }}</text
			><NumberBox id="sceneParallax-repeatX" min="1" max="100"></NumberBox>
			<text>{{ local.getLabel('sceneParallax-repeatY') || 'Repeat Y' }}</text
			><NumberBox id="sceneParallax-repeatY" min="1" max="100"></NumberBox>
			<text>{{ local.getLabel('sceneParallax-anchorX') || 'Anchor X' }}</text
			><NumberBox
				id="sceneParallax-anchorX"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-anchorY') || 'Anchor Y' }}</text
			><NumberBox
				id="sceneParallax-anchorY"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-offsetX') || 'Offset X' }}</text
			><NumberBox
				id="sceneParallax-offsetX"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-offsetY') || 'Offset Y' }}</text
			><NumberBox
				id="sceneParallax-offsetY"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-parallaxFactorX') || 'Parallax Factor X' }}</text
			><NumberBox
				id="sceneParallax-parallaxFactorX"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-parallaxFactorY') || 'Parallax Factor Y' }}</text
			><NumberBox
				id="sceneParallax-parallaxFactorY"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-shiftSpeedX') || 'Shift Speed X' }}</text
			><NumberBox
				id="sceneParallax-shiftSpeedX"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-shiftSpeedY') || 'Shift Speed Y' }}</text
			><NumberBox
				id="sceneParallax-shiftSpeedY"
				min="-10000"
				max="10000"
				step="5"
				decimals="4"
				unit="px/s"
			></NumberBox>
			<text>{{ local.getLabel('sceneParallax-tint-0-box') || 'Tint - Red' }}</text>
			<flex-box id="sceneParallax-tint-0-box">
				<SliderBox
					id="sceneParallax-tint-0-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-0"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('sceneParallax-tint-1-box') || 'Tint - Green' }}</text>
			<flex-box id="sceneParallax-tint-1-box">
				<SliderBox
					id="sceneParallax-tint-1-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-1"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('sceneParallax-tint-2-box') || 'Tint - Blue' }}</text>
			<flex-box id="sceneParallax-tint-2-box">
				<SliderBox
					id="sceneParallax-tint-2-slider"
					min="-255"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-2"
					min="-255"
					max="255"
					step="5"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('sceneParallax-tint-3-box') || 'Tint - Grayscale' }}</text>
			<flex-box id="sceneParallax-tint-3-box">
				<SliderBox
					id="sceneParallax-tint-3-slider"
					min="0"
					max="255"
					step="15"
				></SliderBox>
				<NumberBox
					id="sceneParallax-tint-3"
					min="0"
					max="255"
					step="5"
				></NumberBox>
			</flex-box>
		</detail-grid>
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
	<parameter-pane id="sceneParallax-parameter-pane"></parameter-pane>
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
import SelectBox from '@app/components/common/SelectBox.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
