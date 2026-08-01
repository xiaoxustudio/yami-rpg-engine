<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneTilemap-general-grid') || 'General' }}</detail-summary>
		<detail-grid id="sceneTilemap-general-grid">
			<text>{{ local.getLabel('sceneTilemap-name') || 'Name' }}</text><text-box id="sceneTilemap-name"></text-box>
			<text>{{ local.getLabel('sceneTilemap-layer') || 'Layer' }}</text><select-box id="sceneTilemap-layer"></select-box>
			<text>{{ local.getLabel('sceneTilemap-order') || 'Order' }}</text
			><number-box id="sceneTilemap-order" min="0" max="100"></number-box>
			<text>{{ local.getLabel('sceneTilemap-light') || 'Light Sampling' }}</text
			><select-box id="sceneTilemap-light"></select-box> <text>{{ local.getLabel('sceneTilemap-blend') || 'Blend' }}</text
			><select-box id="sceneTilemap-blend"></select-box> <text>{{ local.getLabel('sceneTilemap-x') || 'X' }}</text
			><number-box
				id="sceneTilemap-x"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-y') || 'Y' }}</text
			><number-box
				id="sceneTilemap-y"
				min="-128"
				max="640"
				step="0.1"
				decimals="4"
				unit="tile"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-width') || 'Width' }}</text
			><number-box
				id="sceneTilemap-width"
				min="0"
				max="512"
				unit="tile"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-height') || 'Height' }}</text
			><number-box
				id="sceneTilemap-height"
				min="0"
				max="512"
				unit="tile"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-anchorX') || 'Anchor X' }}</text
			><number-box
				id="sceneTilemap-anchorX"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-anchorY') || 'Anchor Y' }}</text
			><number-box
				id="sceneTilemap-anchorY"
				min="0"
				max="1"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-offsetX') || 'Offset X' }}</text
			><number-box
				id="sceneTilemap-offsetX"
				min="-10000"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-offsetY') || 'Offset Y' }}</text
			><number-box
				id="sceneTilemap-offsetY"
				min="-10000"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-parallaxFactorX') || 'Parallax Factor X' }}</text
			><number-box
				id="sceneTilemap-parallaxFactorX"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-parallaxFactorY') || 'Parallax Factor Y' }}</text
			><number-box
				id="sceneTilemap-parallaxFactorY"
				min="-4"
				max="4"
				step="0.1"
				decimals="4"
			></number-box>
			<text>{{ local.getLabel('sceneTilemap-opacity') || 'Opacity' }}</text
			><number-box
				id="sceneTilemap-opacity"
				min="0"
				max="1"
				step="0.05"
				decimals="4"
			></number-box>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneTilemap-conditions') || 'Conditions' }}</detail-summary>
		<param-list
			id="sceneTilemap-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneTilemap-events') || 'Events' }}</detail-summary>
		<param-list
			id="sceneTilemap-events"
			class="inspector-list"
			filter="tilemap"
			flexible
		></param-list>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('sceneTilemap-scripts') || 'Scripts' }}</detail-summary>
		<param-list
			id="sceneTilemap-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</detail-box>
	<parameter-pane id="sceneTilemap-parameter-pane"></parameter-pane>
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
