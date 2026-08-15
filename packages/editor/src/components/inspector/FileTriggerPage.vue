<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-general-grid">
			<div class="text">{{ local.getLabel('fileTrigger-selector') || 'Selector' }}</div><SelectBox id="fileTrigger-selector" v-model="form.selector" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-onHitWalls') || 'On Hit Walls' }}</div
			><SelectBox id="fileTrigger-onHitWalls" v-model="form.onHitWalls" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-onHitActors') || 'On Hit Actors' }}</div
			><SelectBox id="fileTrigger-onHitActors" v-model="form.onHitActors" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-hitCount') || 'Hit Count' }}</div
			><NumberBox id="fileTrigger-hitCount" v-model="form.hitCount" min="2" max="10000" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-shape-type') || 'Shape' }}</div><SelectBox id="fileTrigger-shape-type" v-model="form.shapeType" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-shape-width') || 'Width' }}</div
			><NumberBox
				id="fileTrigger-shape-width"
				v-model="form.shapeWidth"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-height') || 'Height' }}</div
			><NumberBox
				id="fileTrigger-shape-height"
				v-model="form.shapeHeight"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-anchor') || 'Anchor' }}</div
			><NumberBox
				id="fileTrigger-shape-anchor"
				v-model="form.shapeAnchor"
				min="-4"
				max="5"
				decimals="4" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-radius') || 'Radius' }}</div
			><NumberBox
				id="fileTrigger-shape-radius"
				v-model="form.shapeRadius"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-centralAngle') || 'Central Angle' }}</div
			><NumberBox
				id="fileTrigger-shape-centralAngle"
				v-model="form.shapeCentralAngle"
				min="0"
				max="360"
				decimals="4"
				unit="deg" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-speed') || 'Speed' }}</div
			><NumberBox
				id="fileTrigger-speed"
				v-model="form.speed"
				min="0"
				max="512"
				decimals="4"
				unit="t/s" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-hitMode') || 'Hit Mode' }}</div><SelectBox id="fileTrigger-hitMode" v-model="form.hitMode" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-hitInterval') || 'Hit Interval' }}</div
			><NumberBox
				id="fileTrigger-hitInterval"
				v-model="form.hitInterval"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-initialDelay') || 'Initial Delay' }}</div
			><NumberBox
				id="fileTrigger-initialDelay"
				v-model="form.initialDelay"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-effectiveTime') || 'Effective Time' }}</div
			><NumberBox
				id="fileTrigger-effectiveTime"
				v-model="form.effectiveTime"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-duration') || 'Duration' }}</div
			><NumberBox
				id="fileTrigger-duration"
				v-model="form.duration"
				min="0"
				max="1000000000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-inherit') || 'Inherit' }}</div
			><CustomBox id="fileTrigger-inherit" :model-value="form.inherit" type="file" filter="trigger" @input="onParamInput" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-animation-grid') || 'Animation' }}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-animation-grid">
			<div class="text">{{ local.getLabel('fileTrigger-animationId') || 'Animation' }}</div
			><CustomBox
				id="fileTrigger-animationId"
				:model-value="form.animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-motion') || 'Motion' }}</div><SelectBox id="fileTrigger-motion" v-model="form.motion" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-priority') || 'Priority' }}</div
			><NumberBox id="fileTrigger-priority" v-model="form.priority" min="-100" max="100" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-offsetY') || 'Offset Y' }}</div
			><NumberBox
				id="fileTrigger-offsetY"
				v-model="form.offsetY"
				min="-100"
				max="100"
				unit="px" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-rotatable') || 'Rotatable' }}</div><SelectBox id="fileTrigger-rotatable" v-model="form.rotatable" @input="onParamInput" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileTrigger-events"
			class="inspector-list"
			filter="trigger"
			flexible
			@change="onListChange"
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileTrigger-scripts"
			class="inspector-list"
			flexible
			@change="onListChange"
		/>
	</DetailBox>
	<ParameterPane id="fileTrigger-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useFileTriggerPage } from '@app/composables/useFileTriggerPage';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { attachElementApi } from '@/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const { form, sync, onParamInput } = useFileTriggerPage();

const onAnimationIdWrite = (value: unknown) => {
	Inspector?.fileTrigger?.animationIdWrite?.({ value });
};
const onListChange = () => {
	Inspector?.fileTrigger?.listChange?.();
};

onMounted(() => {
	const el = document.getElementById('fileTrigger-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>
