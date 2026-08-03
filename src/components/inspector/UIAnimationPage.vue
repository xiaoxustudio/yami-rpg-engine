<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiAnimation-properties-grid') || 'Animation Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiAnimation-properties-grid">
			<div class="text">{{ local.getLabel('uiAnimation-animation') || 'Animation' }}</div
			><CustomBox
				id="uiAnimation-animation"
				type="file"
				filter="animation"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiAnimation-motion') || 'Motion' }}</div><SelectBox id="uiAnimation-motion"></SelectBox>
			<div class="text">{{ local.getLabel('uiAnimation-autoplay') || 'Autoplay' }}</div
			><CheckBox
				id="uiAnimation-autoplay"
				class="standard large"
			></CheckBox>
			<div class="text">{{ local.getLabel('uiAnimation-rotatable') || 'Rotatable' }}</div
			><CheckBox
				id="uiAnimation-rotatable"
				class="standard large"
			></CheckBox>
			<div class="text">{{ local.getLabel('uiAnimation-angle') || 'Angle' }}</div
			><NumberBox
				id="uiAnimation-angle"
				min="0"
				max="360"
				unit="deg"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiAnimation-frame') || 'Frame' }}</div
			><NumberBox id="uiAnimation-frame" min="0" max="10000"></NumberBox>
			<div class="text">{{ local.getLabel('uiAnimation-offset-box') || 'Offset' }}</div>
			<div
				id="uiAnimation-offset-box"
				class="box uiElement-grid-box with-2-columns"
			>
				<NumberBox
					id="uiAnimation-offsetX"
					min="-10000"
					max="10000"
					unit="px"
				></NumberBox>
				<NumberBox
					id="uiAnimation-offsetY"
					min="-10000"
					max="10000"
					unit="px"
				></NumberBox>
			</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
