<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneActor-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneActor-general-grid">
			<div class="text">{{ local.getLabel('sceneActor-name') || 'Name' }}</div><TextBox id="sceneActor-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneActor-type') || 'Type' }}</div><SelectBox id="sceneActor-type" v-model="form.type" @input="onParamInput" @write="onTypeWrite"></SelectBox>
			<div class="text">{{ local.getLabel('sceneActor-actorId') || 'Actor' }}</div
			><CustomBox
				id="sceneActor-actorId"
				:model-value="form.actorId"
				type="file"
				filter="actor"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('sceneActor-teamId') || 'Team' }}</div><SelectBox id="sceneActor-teamId" v-model="form.teamId" @input="onParamInput"></SelectBox>
			<div class="text">{{ local.getLabel('sceneActor-x') || 'X' }}</div
			><NumberBox
				id="sceneActor-x"
				v-model="form.x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneActor-y') || 'Y' }}</div
			><NumberBox
				id="sceneActor-y"
				v-model="form.y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				@input="onParamInput"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneActor-angle-box') || 'Angle' }}</div
			><div class="flex-box" id="sceneActor-angle-box">
				<SliderBox
					id="sceneActor-angle-slider"
					v-model="form.angle"
					min="0"
					max="360"
					step="45"
				></SliderBox>
				<NumberBox
					id="sceneActor-angle"
					v-model="form.angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
					@input="onParamInput"
				></NumberBox>
			</div>
			<div class="text">{{ local.getLabel('sceneActor-scale-box') || 'Scale' }}</div
			><div class="flex-box" id="sceneActor-scale-box">
				<SliderBox
					id="sceneActor-scale-slider"
					v-model="form.scale"
					min="0"
					max="2"
					step="0.1"
				></SliderBox>
				<NumberBox
					id="sceneActor-scale"
					v-model="form.scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
					@input="onParamInput"
				></NumberBox>
			</div>
		</div>
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
import { Inspector } from '@/inspector/inspector.ts';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
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

const { form, sync, onParamInput } = useSceneActorPage();

const onTypeWrite = (value: unknown) => {
	Inspector?.sceneActor?.typeWrite?.({ value });
};

onMounted(() => {
	const el = document.getElementById('sceneActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
