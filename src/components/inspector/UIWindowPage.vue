<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiWindow-properties-grid') || 'Window Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiWindow-properties-grid">
			<div class="text">{{ local.getLabel('uiWindow-layout') || 'Layout' }}</div><SelectBox id="uiWindow-layout"></SelectBox>
			<div class="text">{{ local.getLabel('uiWindow-scrollX') || 'Scroll X' }}</div
			><NumberBox
				id="uiWindow-scrollX"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-scrollY') || 'Scroll Y' }}</div
			><NumberBox
				id="uiWindow-scrollY"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-gridWidth') || 'Grid Width' }}</div
			><NumberBox
				id="uiWindow-gridWidth"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-gridHeight') || 'Grid Height' }}</div
			><NumberBox
				id="uiWindow-gridHeight"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-gridGapX') || 'Grid Gap X' }}</div
			><NumberBox
				id="uiWindow-gridGapX"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-gridGapY') || 'Grid Gap Y' }}</div
			><NumberBox
				id="uiWindow-gridGapY"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-paddingX') || 'Padding X' }}</div
			><NumberBox
				id="uiWindow-paddingX"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-paddingY') || 'Padding Y' }}</div
			><NumberBox
				id="uiWindow-paddingY"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<div class="text">{{ local.getLabel('uiWindow-overflow') || 'Overflow' }}</div><SelectBox id="uiWindow-overflow"></SelectBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import NumberBox from '@app/components/common/NumberBox.vue';
import SelectBox from '@app/components/common/SelectBox.vue';

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
