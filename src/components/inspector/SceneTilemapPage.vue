<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-general-grid') || 'General' }}</DetailSummary>
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
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-conditions') || 'Conditions' }}</DetailSummary>
		<param-list
			id="sceneTilemap-conditions"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-events') || 'Events' }}</DetailSummary>
		<param-list
			id="sceneTilemap-events"
			class="inspector-list"
			filter="tilemap"
			flexible
		></param-list>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('sceneTilemap-scripts') || 'Scripts' }}</DetailSummary>
		<param-list
			id="sceneTilemap-scripts"
			class="inspector-list"
			flexible
		></param-list>
	</DetailBox>
	<parameter-pane id="sceneTilemap-parameter-pane"></parameter-pane>
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
