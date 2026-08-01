<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneActor-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="sceneActor-general-grid">
			<text>{{ local.getLabel('sceneActor-name') || 'Name' }}</text><text-box id="sceneActor-name"></text-box>
			<text>{{ local.getLabel('sceneActor-type') || 'Type' }}</text><select-box id="sceneActor-type"></select-box>
			<text>{{ local.getLabel('sceneActor-actorId') || 'Actor' }}</text
			><custom-box
				id="sceneActor-actorId"
				type="file"
				filter="actor"
			></custom-box>
			<text>{{ local.getLabel('sceneActor-teamId') || 'Team' }}</text><select-box id="sceneActor-teamId"></select-box>
			<text>{{ local.getLabel('sceneActor-x') || 'X' }}</text
			><number-box
				id="sceneActor-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneActor-y') || 'Y' }}</text
			><number-box
				id="sceneActor-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneActor-angle-box') || 'Angle' }}</text
			><flex-box id="sceneActor-angle-box">
				<slider-box
					id="sceneActor-angle-slider"
					min="0"
					max="360"
					step="45"
				></slider-box>
				<number-box
					id="sceneActor-angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneActor-scale-box') || 'Scale' }}</text
			><flex-box id="sceneActor-scale-box">
				<slider-box
					id="sceneActor-scale-slider"
					min="0"
					max="2"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneActor-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneActor-conditions') || 'Conditions' }}</detail-summary>
		<param-list
			id="sceneActor-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneActor-events') || 'Events' }}</detail-summary>
		<param-list
			id="sceneActor-events"
			class="inspector-list"
			filter="actor"
			flexible
		></param-list>
	</detail-box>
	<detail-box id="sceneActor-scripts-detail" open>
		<detail-summary>{{ local.getLabel('sceneActor-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="sceneActor-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<parameter-pane id="sceneActor-parameter-pane"></parameter-pane>
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
