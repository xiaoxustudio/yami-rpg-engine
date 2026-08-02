<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneTilemap-general-grid">
			<text>{{ local.getLabel('sceneTilemap-name') || 'Name' }}</text><TextBox id="sceneTilemap-name"></TextBox>
			<text>{{ local.getLabel('sceneTilemap-layer') || 'Layer' }}</text><SelectBox id="sceneTilemap-layer"></SelectBox>
			<text>{{ local.getLabel('sceneTilemap-order') || 'Order' }}</text
			><NumberBox id="sceneTilemap-order" min="0" max="100"></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-light') || 'Light Sampling' }}</text
			><SelectBox id="sceneTilemap-light"></SelectBox> <text>{{ local.getLabel('sceneTilemap-blend') || 'Blend' }}</text
			><SelectBox id="sceneTilemap-blend"></SelectBox> <text>{{ local.getLabel('sceneTilemap-x') || 'X' }}</text
			><NumberBox
				id="sceneTilemap-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-y') || 'Y' }}</text
			><NumberBox
				id="sceneTilemap-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-width') || 'Width' }}</text
			><NumberBox
				id="sceneTilemap-width"
				min="0"
				max="512"
				unit="tile"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-height') || 'Height' }}</text
			><NumberBox
				id="sceneTilemap-height"
				min="0"
				max="512"
				unit="tile"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-anchorX') || 'Anchor X' }}</text
			><NumberBox
				id="sceneTilemap-anchorX"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-anchorY') || 'Anchor Y' }}</text
			><NumberBox
				id="sceneTilemap-anchorY"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-offsetX') || 'Offset X' }}</text
			><NumberBox
				id="sceneTilemap-offsetX"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-offsetY') || 'Offset Y' }}</text
			><NumberBox
				id="sceneTilemap-offsetY"
				min="-10000"
				max="10000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-parallaxFactorX') || 'Parallax Factor X' }}</text
			><NumberBox
				id="sceneTilemap-parallaxFactorX"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-parallaxFactorY') || 'Parallax Factor Y' }}</text
			><NumberBox
				id="sceneTilemap-parallaxFactorY"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneTilemap-opacity') || 'Opacity' }}</text
			><NumberBox
				id="sceneTilemap-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></NumberBox>
		</detail-grid>
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
	<parameter-pane id="sceneTilemap-parameter-pane"></parameter-pane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
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
