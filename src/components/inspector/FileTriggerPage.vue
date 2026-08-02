<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="fileTrigger-general-grid">
			<text>{{ local.getLabel('fileTrigger-selector') || 'Selector' }}</text><SelectBox id="fileTrigger-selector" />
			<text>{{ local.getLabel('fileTrigger-onHitWalls') || 'On Hit Walls' }}</text
			><SelectBox id="fileTrigger-onHitWalls" />
			<text>{{ local.getLabel('fileTrigger-onHitActors') || 'On Hit Actors' }}</text
			><SelectBox id="fileTrigger-onHitActors" />
			<text>{{ local.getLabel('fileTrigger-hitCount') || 'Hit Count' }}</text
			><NumberBox id="fileTrigger-hitCount" min="2" max="10000" />
			<text>{{ local.getLabel('fileTrigger-shape-type') || 'Shape' }}</text><SelectBox id="fileTrigger-shape-type" />
			<text>{{ local.getLabel('fileTrigger-shape-width') || 'Width' }}</text
			><NumberBox
				id="fileTrigger-shape-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-height') || 'Height' }}</text
			><NumberBox
				id="fileTrigger-shape-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-anchor') || 'Anchor' }}</text
			><NumberBox
				id="fileTrigger-shape-anchor"
				min="-4"
				max="5"
				decimals="4"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-radius') || 'Radius' }}</text
			><NumberBox
				id="fileTrigger-shape-radius"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-centralAngle') || 'Central Angle' }}</text
			><NumberBox
				id="fileTrigger-shape-centralAngle"
				min="0"
				max="360"
				decimals="4"
				unit="deg"
			/>
			<text>{{ local.getLabel('fileTrigger-speed') || 'Speed' }}</text
			><NumberBox
				id="fileTrigger-speed"
				min="0"
				max="512"
				decimals="4"
				unit="t/s"
			/>
			<text>{{ local.getLabel('fileTrigger-hitMode') || 'Hit Mode' }}</text><SelectBox id="fileTrigger-hitMode" />
			<text>{{ local.getLabel('fileTrigger-hitInterval') || 'Hit Interval' }}</text
			><NumberBox
				id="fileTrigger-hitInterval"
				min="0"
				max="10000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-initialDelay') || 'Initial Delay' }}</text
			><NumberBox
				id="fileTrigger-initialDelay"
				min="0"
				max="10000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-effectiveTime') || 'Effective Time' }}</text
			><NumberBox
				id="fileTrigger-effectiveTime"
				min="0"
				max="10000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-duration') || 'Duration' }}</text
			><NumberBox
				id="fileTrigger-duration"
				min="0"
				max="1000000000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-inherit') || 'Inherit' }}</text
			><CustomBox id="fileTrigger-inherit" type="file" filter="trigger" />
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileTrigger-animation-grid') || 'Animation' }}</DetailSummary>
		<detail-grid id="fileTrigger-animation-grid">
			<text>{{ local.getLabel('fileTrigger-animationId') || 'Animation' }}</text
			><CustomBox
				id="fileTrigger-animationId"
				type="file"
				filter="animation"
			/>
			<text>{{ local.getLabel('fileTrigger-motion') || 'Motion' }}</text><SelectBox id="fileTrigger-motion" />
			<text>{{ local.getLabel('fileTrigger-priority') || 'Priority' }}</text
			><NumberBox id="fileTrigger-priority" min="-100" max="100" />
			<text>{{ local.getLabel('fileTrigger-offsetY') || 'Offset Y' }}</text
			><NumberBox
				id="fileTrigger-offsetY"
				min="-100"
				max="100"
				unit="px"
			/>
			<text>{{ local.getLabel('fileTrigger-rotatable') || 'Rotatable' }}</text><SelectBox id="fileTrigger-rotatable" />
		</detail-grid>
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

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
