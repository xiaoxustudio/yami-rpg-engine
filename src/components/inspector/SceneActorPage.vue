<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneActor-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneActor-general-grid">
			<text>{{ local.getLabel('sceneActor-name') || 'Name' }}</text><TextBox id="sceneActor-name"></TextBox>
			<text>{{ local.getLabel('sceneActor-type') || 'Type' }}</text><SelectBox id="sceneActor-type"></SelectBox>
			<text>{{ local.getLabel('sceneActor-actorId') || 'Actor' }}</text
			><CustomBox
				id="sceneActor-actorId"
				type="file"
				filter="actor"
			></CustomBox>
			<text>{{ local.getLabel('sceneActor-teamId') || 'Team' }}</text><SelectBox id="sceneActor-teamId"></SelectBox>
			<text>{{ local.getLabel('sceneActor-x') || 'X' }}</text
			><NumberBox
				id="sceneActor-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneActor-y') || 'Y' }}</text
			><NumberBox
				id="sceneActor-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<text>{{ local.getLabel('sceneActor-angle-box') || 'Angle' }}</text
			><flex-box id="sceneActor-angle-box">
				<SliderBox
					id="sceneActor-angle-slider"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneActor-angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></NumberBox>
			</flex-box>
			<text>{{ local.getLabel('sceneActor-scale-box') || 'Scale' }}</text
			><flex-box id="sceneActor-scale-box">
				<SliderBox
					id="sceneActor-scale-slider"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneActor-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></NumberBox>
			</flex-box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneActor-conditions') || 'Conditions' }}</DetailSummary>
		<ParamList
			id="sceneActor-conditions"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneActor-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="sceneActor-events"
			class="inspector-list"
			filter="actor"
			flexible
		></ParamList>
	</DetailBox>
	<DetailBox id="sceneActor-scripts-detail" open>
		<DetailSummary>{{ local.getLabel('sceneActor-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="sceneActor-scripts"
			class="inspector-list"
			flexible
		></ParamList>
	</DetailBox>
	<ParameterPane id="sceneActor-parameter-pane"></ParameterPane>
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
