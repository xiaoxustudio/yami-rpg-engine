<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiWindow-properties-grid') || 'Window Properties' }}</DetailSummary>
		<detail-grid id="uiWindow-properties-grid">
			<text>{{ local.getLabel('uiWindow-layout') || 'Layout' }}</text><select-box id="uiWindow-layout"></select-box>
			<text>{{ local.getLabel('uiWindow-scrollX') || 'Scroll X' }}</text
			><number-box
				id="uiWindow-scrollX"
				min="0"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-scrollY') || 'Scroll Y' }}</text
			><number-box
				id="uiWindow-scrollY"
				min="0"
				max="10000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-gridWidth') || 'Grid Width' }}</text
			><number-box
				id="uiWindow-gridWidth"
				min="0"
				max="1000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-gridHeight') || 'Grid Height' }}</text
			><number-box
				id="uiWindow-gridHeight"
				min="0"
				max="1000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-gridGapX') || 'Grid Gap X' }}</text
			><number-box
				id="uiWindow-gridGapX"
				min="0"
				max="1000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-gridGapY') || 'Grid Gap Y' }}</text
			><number-box
				id="uiWindow-gridGapY"
				min="0"
				max="1000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-paddingX') || 'Padding X' }}</text
			><number-box
				id="uiWindow-paddingX"
				min="0"
				max="1000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-paddingY') || 'Padding Y' }}</text
			><number-box
				id="uiWindow-paddingY"
				min="0"
				max="1000"
				unit="px"
			></number-box>
			<text>{{ local.getLabel('uiWindow-overflow') || 'Overflow' }}</text><select-box id="uiWindow-overflow"></select-box>
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
