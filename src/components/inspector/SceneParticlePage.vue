<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneParticle-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="sceneParticle-general-grid">
			<text>{{ local.getLabel('sceneParticle-name') || 'Name' }}</text><text-box id="sceneParticle-name"></text-box>
			<text>{{ local.getLabel('sceneParticle-particleId') || 'Particle' }}</text
			><custom-box
				id="sceneParticle-particleId"
				type="file"
				filter="particle"
			></custom-box>
			<text>{{ local.getLabel('sceneParticle-x') || 'X' }}</text
			><number-box
				id="sceneParticle-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneParticle-y') || 'Y' }}</text
			><number-box
				id="sceneParticle-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneParticle-angle-box') || 'Angle' }}</text
			><flex-box id="sceneParticle-angle-box">
				<slider-box
					id="sceneParticle-angle-slider"
					min="0"
					max="360"
					step="45"
				></slider-box>
				<number-box
					id="sceneParticle-angle"
					min="-360"
					max="360"
					step="45"
					decimals="4"
					unit="deg"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneParticle-scale-box') || 'Scale' }}</text
			><flex-box id="sceneParticle-scale-box">
				<slider-box
					id="sceneParticle-scale-slider"
					min="0"
					max="2"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneParticle-scale"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneParticle-speed-box') || 'Speed' }}</text
			><flex-box id="sceneParticle-speed-box">
				<slider-box
					id="sceneParticle-speed-slider"
					min="0"
					max="2"
					step="0.1"
				></slider-box>
				<number-box
					id="sceneParticle-speed"
					min="0"
					max="10"
					step="0.1"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneParticle-opacity-box') || 'Opacity' }}</text
			><flex-box id="sceneParticle-opacity-box">
				<slider-box
					id="sceneParticle-opacity-slider"
					min="0"
					max="1"
					step="0.05"
				></slider-box>
				<number-box
					id="sceneParticle-opacity"
					min="0"
					max="1"
					step="0.05"
					decimals="4"
				></number-box>
			</flex-box>
			<text>{{ local.getLabel('sceneParticle-priority-box') || 'Priority' }}</text
			><flex-box id="sceneParticle-priority-box">
				<slider-box
					id="sceneParticle-priority-slider"
					min="-4"
					max="4"
					step="1"
				></slider-box>
				<number-box
					id="sceneParticle-priority"
					min="-512"
					max="512"
				></number-box>
			</flex-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneParticle-conditions') || 'Conditions' }}</detail-summary>
		<param-list
			id="sceneParticle-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneParticle-events') || 'Events' }}</detail-summary>
		<param-list
			id="sceneParticle-events"
			class="inspector-list"
			filter="particle"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneParticle-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="sceneParticle-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<parameter-pane id="sceneParticle-parameter-pane"></parameter-pane>
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
