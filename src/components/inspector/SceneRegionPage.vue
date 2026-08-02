<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-general-grid') || 'General' }}</DetailSummary>
		<detail-grid id="sceneRegion-general-grid">
			<text>{{ local.getLabel('sceneRegion-name') || 'Name' }}</text><text-box id="sceneRegion-name"></text-box>
			<text>{{ local.getLabel('sceneRegion-color') || 'Color' }}</text><color-box id="sceneRegion-color"></color-box>
			<text>{{ local.getLabel('sceneRegion-x') || 'X' }}</text
			><number-box
				id="sceneRegion-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneRegion-y') || 'Y' }}</text
			><number-box
				id="sceneRegion-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneRegion-width') || 'Width' }}</text
			><number-box
				id="sceneRegion-width"
				min="0"
				max="512"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneRegion-height') || 'Height' }}</text
			><number-box
				id="sceneRegion-height"
				min="0"
				max="512"
				decimals="4"
			></number-box>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-conditions') || 'Conditions' }}</DetailSummary>
		<param-list
			id="sceneRegion-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-events') || 'Events' }}</DetailSummary>
		<param-list
			id="sceneRegion-events"
			class="inspector-list"
			filter="region"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneRegion-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="sceneRegion-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<parameter-pane id="sceneRegion-parameter-pane"></parameter-pane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
