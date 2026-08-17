<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="sceneRegion-general-grid">
			<div class="text">{{ local.getLabel('sceneRegion-name') || 'Name' }}</div><TextBox id="sceneRegion-name" v-model="form.name" @input="onParamInput"></TextBox>
			<div class="text">{{ local.getLabel('sceneRegion-color') || 'Color' }}</div><ColorBox id="sceneRegion-color" v-model="form.color" @input="onParamInput"></ColorBox>
			<div class="text">{{ local.getLabel('sceneRegion-x') || 'X' }}</div
			><NumberBox
				id="sceneRegion-x" v-model="form.x" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneRegion-y') || 'Y' }}</div
			><NumberBox
				id="sceneRegion-y" v-model="form.y" @input="onParamInput"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneRegion-width') || 'Width' }}</div
			><NumberBox
				id="sceneRegion-width" v-model="form.width" @input="onParamInput"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
			<div class="text">{{ local.getLabel('sceneRegion-height') || 'Height' }}</div
			><NumberBox
				id="sceneRegion-height" v-model="form.height" @input="onParamInput"
				min="0"
				max="512"
				decimals="4"
			></NumberBox>
		</div>
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
import { useSceneRegionPage } from '@app/composables/useSceneRegionPage';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ColorBox from '@app/components/common/ColorBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';

const scene = useSceneStore();
const local = useLocalStore();

const { form, sync, onParamInput } = useSceneRegionPage();

onMounted(() => {
	const el = document.getElementById('sceneRegion-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
