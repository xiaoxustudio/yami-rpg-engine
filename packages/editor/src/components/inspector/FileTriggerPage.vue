<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-general-grid') || 'General' }}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-general-grid">
			<div class="text">{{ local.getLabel('fileTrigger-selector') || 'Selector' }}</div><SelectBox id="fileTrigger-selector" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-onHitWalls') || 'On Hit Walls' }}</div
			><SelectBox id="fileTrigger-onHitWalls" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-onHitActors') || 'On Hit Actors' }}</div
			><SelectBox id="fileTrigger-onHitActors" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-hitCount') || 'Hit Count' }}</div
			><NumberBox id="fileTrigger-hitCount" min="2" max="10000" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-shape-type') || 'Shape' }}</div><SelectBox id="fileTrigger-shape-type" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-shape-width') || 'Width' }}</div
			><NumberBox
				id="fileTrigger-shape-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-height') || 'Height' }}</div
			><NumberBox
				id="fileTrigger-shape-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-anchor') || 'Anchor' }}</div
			><NumberBox
				id="fileTrigger-shape-anchor"
				min="-4"
				max="5"
				decimals="4" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-radius') || 'Radius' }}</div
			><NumberBox
				id="fileTrigger-shape-radius"
				min="0"
				max="512"
				decimals="4"
				unit="tile" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-shape-centralAngle') || 'Central Angle' }}</div
			><NumberBox
				id="fileTrigger-shape-centralAngle"
				min="0"
				max="360"
				decimals="4"
				unit="deg" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-speed') || 'Speed' }}</div
			><NumberBox
				id="fileTrigger-speed"
				min="0"
				max="512"
				decimals="4"
				unit="t/s" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-hitMode') || 'Hit Mode' }}</div><SelectBox id="fileTrigger-hitMode" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-hitInterval') || 'Hit Interval' }}</div
			><NumberBox
				id="fileTrigger-hitInterval"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-initialDelay') || 'Initial Delay' }}</div
			><NumberBox
				id="fileTrigger-initialDelay"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-effectiveTime') || 'Effective Time' }}</div
			><NumberBox
				id="fileTrigger-effectiveTime"
				min="0"
				max="10000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-duration') || 'Duration' }}</div
			><NumberBox
				id="fileTrigger-duration"
				min="0"
				max="1000000000"
				unit="ms" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-inherit') || 'Inherit' }}</div
			><CustomBox id="fileTrigger-inherit" type="file" filter="trigger" @input="onParamInput" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-animation-grid') || 'Animation' }}</DetailSummary>
		<div class="detail-grid" id="fileTrigger-animation-grid">
			<div class="text">{{ local.getLabel('fileTrigger-animationId') || 'Animation' }}</div
			><CustomBox
				id="fileTrigger-animationId"
				type="file"
				filter="animation"
				@input="onParamInput"
				@write="onAnimationIdWrite"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-motion') || 'Motion' }}</div><SelectBox id="fileTrigger-motion" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-priority') || 'Priority' }}</div
			><NumberBox id="fileTrigger-priority" min="-100" max="100" @input="onParamInput" />
			<div class="text">{{ local.getLabel('fileTrigger-offsetY') || 'Offset Y' }}</div
			><NumberBox
				id="fileTrigger-offsetY"
				min="-100"
				max="100"
				unit="px" @input="onParamInput"
			/>
			<div class="text">{{ local.getLabel('fileTrigger-rotatable') || 'Rotatable' }}</div><SelectBox id="fileTrigger-rotatable" @input="onParamInput" />
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-events') || 'Events' }}</DetailSummary>
		<ParamList
			id="fileTrigger-events"
			class="inspector-list"
			filter="trigger"
			flexible
		/>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-scripts') || 'Scripts' }}</DetailSummary>
		<ParamList
			id="fileTrigger-scripts"
			class="inspector-list"
			flexible
		/>
	</DetailBox>
	<ParameterPane id="fileTrigger-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import ParamList from '@app/components/common/ParamList.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const onParamInput = (event: any) => {
	const target = event?.target ?? document.activeElement;
	(window as any).Inspector?.fileTrigger?.paramInput?.({ target });
};
const onAnimationIdWrite = (value: any) => {
	(window as any).Inspector?.fileTrigger?.animationIdWrite?.({ value });
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
