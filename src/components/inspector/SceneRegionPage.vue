<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneRegion-general-grid') || 'General' }}</detail-summary>
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
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneRegion-conditions') || 'Conditions' }}</detail-summary>
		<param-list
			id="sceneRegion-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneRegion-events') || 'Events' }}</detail-summary>
		<param-list
			id="sceneRegion-events"
			class="inspector-list"
			filter="region"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneRegion-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="sceneRegion-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<parameter-pane id="sceneRegion-parameter-pane"></parameter-pane>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useSceneStore } from '@app/stores/scene';
import { useLocalStore } from '@app/stores/local';

const scene = useSceneStore();
const local = useLocalStore();

onMounted(() => {
	scene.syncState();
	local.syncState();
});
</script>
