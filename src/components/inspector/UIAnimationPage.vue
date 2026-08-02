<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiAnimation-properties-grid') || 'Animation Properties' }}</DetailSummary>
		<detail-grid id="uiAnimation-properties-grid">
			<text>{{ local.getLabel('uiAnimation-animation') || 'Animation' }}</text
			><custom-box
				id="uiAnimation-animation"
				type="file"
				filter="animation"
			></custom-box>
			<text>{{ local.getLabel('uiAnimation-motion') || 'Motion' }}</text><select-box id="uiAnimation-motion"></select-box>
			<text>{{ local.getLabel('uiAnimation-autoplay') || 'Autoplay' }}</text
			><check-box
				id="uiAnimation-autoplay"
				class="standard large"
			></check-box>
			<text>{{ local.getLabel('uiAnimation-rotatable') || 'Rotatable' }}</text
			><check-box
				id="uiAnimation-rotatable"
				class="standard large"
			></check-box>
			<text>{{ local.getLabel('uiAnimation-angle') || 'Angle' }}</text
			><number-box
				id="uiAnimation-angle"
				min="0"
				max="360"
				unit="deg"
			></number-box>
			<text>{{ local.getLabel('uiAnimation-frame') || 'Frame' }}</text
			><number-box id="uiAnimation-frame" min="0" max="10000"></number-box>
			<text>{{ local.getLabel('uiAnimation-offset-box') || 'Offset' }}</text>
			<box
				id="uiAnimation-offset-box"
				class="uiElement-grid-box with-2-columns"
			>
				<number-box
					id="uiAnimation-offsetX"
					min="-10000"
					max="10000"
					unit="px"
				></number-box>
				<number-box
					id="uiAnimation-offsetY"
					min="-10000"
					max="10000"
					unit="px"
				></number-box>
			</box>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
