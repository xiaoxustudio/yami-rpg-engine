<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneRegion-general-grid">
			<text>{{ local.getLabel('sceneRegion-name') || 'Name' }}</text><TextBox id="sceneRegion-name"></TextBox>
			<text>{{ local.getLabel('sceneRegion-color') || 'Color' }}</text><ColorBox id="sceneRegion-color"></ColorBox>
			<text>{{ local.getLabel('sceneRegion-x') || 'X' }}</text
			><NumberBox
				id="sceneRegion-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneRegion-y') || 'Y' }}</text
			><NumberBox
				id="sceneRegion-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneRegion-width') || 'Width' }}</text
			><NumberBox
				id="sceneRegion-width"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneRegion-height') || 'Height' }}</text
			><NumberBox
				id="sceneRegion-height"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneRegion-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneRegion-events"
			class="inspector-list"
			filter="region"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneRegion-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneRegion-parameter-pane"></ParameterPane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
