<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileTrigger-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="fileTrigger-general-grid">
			<text>{{ local.getLabel('fileTrigger-selector') || 'Selector' }}</text><select-box id="fileTrigger-selector" />
			<text>{{ local.getLabel('fileTrigger-onHitWalls') || 'On Hit Walls' }}</text
			><select-box id="fileTrigger-onHitWalls" />
			<text>{{ local.getLabel('fileTrigger-onHitActors') || 'On Hit Actors' }}</text
			><select-box id="fileTrigger-onHitActors" />
			<text>{{ local.getLabel('fileTrigger-hitCount') || 'Hit Count' }}</text
			><number-box id="fileTrigger-hitCount" min="2" max="10000" />
			<text>{{ local.getLabel('fileTrigger-shape-type') || 'Shape' }}</text><select-box id="fileTrigger-shape-type" />
			<text>{{ local.getLabel('fileTrigger-shape-width') || 'Width' }}</text
			><number-box
				id="fileTrigger-shape-width"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-height') || 'Height' }}</text
			><number-box
				id="fileTrigger-shape-height"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-anchor') || 'Anchor' }}</text
			><number-box
				id="fileTrigger-shape-anchor"
				min="-4"
				max="5"
				decimals="4"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-radius') || 'Radius' }}</text
			><number-box
				id="fileTrigger-shape-radius"
				min="0"
				max="512"
				decimals="4"
				unit="tile"
			/>
			<text>{{ local.getLabel('fileTrigger-shape-centralAngle') || 'Central Angle' }}</text
			><number-box
				id="fileTrigger-shape-centralAngle"
				min="0"
				max="360"
				decimals="4"
				unit="deg"
			/>
			<text>{{ local.getLabel('fileTrigger-speed') || 'Speed' }}</text
			><number-box
				id="fileTrigger-speed"
				min="0"
				max="512"
				decimals="4"
				unit="t/s"
			/>
			<text>{{ local.getLabel('fileTrigger-hitMode') || 'Hit Mode' }}</text><select-box id="fileTrigger-hitMode" />
			<text>{{ local.getLabel('fileTrigger-hitInterval') || 'Hit Interval' }}</text
			><number-box
				id="fileTrigger-hitInterval"
				min="0"
				max="10000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-initialDelay') || 'Initial Delay' }}</text
			><number-box
				id="fileTrigger-initialDelay"
				min="0"
				max="10000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-effectiveTime') || 'Effective Time' }}</text
			><number-box
				id="fileTrigger-effectiveTime"
				min="0"
				max="10000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-duration') || 'Duration' }}</text
			><number-box
				id="fileTrigger-duration"
				min="0"
				max="1000000000"
				unit="ms"
			/>
			<text>{{ local.getLabel('fileTrigger-inherit') || 'Inherit' }}</text
			><custom-box id="fileTrigger-inherit" type="file" filter="trigger" />
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileTrigger-animation-grid') || 'Animation' }}</detail-summary>
		<detail-grid id="fileTrigger-animation-grid">
			<text>{{ local.getLabel('fileTrigger-animationId') || 'Animation' }}</text
			><custom-box
				id="fileTrigger-animationId"
				type="file"
				filter="animation"
			/>
			<text>{{ local.getLabel('fileTrigger-motion') || 'Motion' }}</text><select-box id="fileTrigger-motion" />
			<text>{{ local.getLabel('fileTrigger-priority') || 'Priority' }}</text
			><number-box id="fileTrigger-priority" min="-100" max="100" />
			<text>{{ local.getLabel('fileTrigger-offsetY') || 'Offset Y' }}</text
			><number-box
				id="fileTrigger-offsetY"
				min="-100"
				max="100"
				unit="px"
			/>
			<text>{{ local.getLabel('fileTrigger-rotatable') || 'Rotatable' }}</text><select-box id="fileTrigger-rotatable" />
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileTrigger-events') || 'Events' }}</detail-summary>
		<param-list
			id="fileTrigger-events"
			class="inspector-list"
			filter="trigger"
			flexible
		/>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileTrigger-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="fileTrigger-scripts"
			class="inspector-list"
			flexible
		/>
	</detail-box>
	<parameter-pane id="fileTrigger-parameter-pane" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
