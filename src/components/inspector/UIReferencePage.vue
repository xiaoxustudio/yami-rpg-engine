<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiReference-properties-grid') || 'Reference Properties' }}</DetailSummary>
		<detail-grid id="uiReference-properties-grid">
			<text>{{ local.getLabel('uiReference-prefabId') || 'Prefab' }}</text
			><custom-box
				id="uiReference-prefabId"
				type="preset-element"
			></custom-box>
			<text>{{ local.getLabel('uiReference-synchronous') || 'Synchronous' }}</text
			><check-box
				id="uiReference-synchronous"
				class="standard large"
			></check-box>
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
