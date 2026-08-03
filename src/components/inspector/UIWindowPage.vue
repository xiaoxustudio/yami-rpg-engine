<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiWindow-properties-grid') || 'Window Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiWindow-properties-grid">
			<text>{{ local.getLabel('uiWindow-layout') || 'Layout' }}</text><SelectBox id="uiWindow-layout"></SelectBox>
			<text>{{ local.getLabel('uiWindow-scrollX') || 'Scroll X' }}</text
			><NumberBox
				id="uiWindow-scrollX"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-scrollY') || 'Scroll Y' }}</text
			><NumberBox
				id="uiWindow-scrollY"
				min="0"
				max="10000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-gridWidth') || 'Grid Width' }}</text
			><NumberBox
				id="uiWindow-gridWidth"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-gridHeight') || 'Grid Height' }}</text
			><NumberBox
				id="uiWindow-gridHeight"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-gridGapX') || 'Grid Gap X' }}</text
			><NumberBox
				id="uiWindow-gridGapX"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-gridGapY') || 'Grid Gap Y' }}</text
			><NumberBox
				id="uiWindow-gridGapY"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-paddingX') || 'Padding X' }}</text
			><NumberBox
				id="uiWindow-paddingX"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-paddingY') || 'Padding Y' }}</text
			><NumberBox
				id="uiWindow-paddingY"
				min="0"
				max="1000"
				unit="px"
			></NumberBox>
			<text>{{ local.getLabel('uiWindow-overflow') || 'Overflow' }}</text><SelectBox id="uiWindow-overflow"></SelectBox>
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
