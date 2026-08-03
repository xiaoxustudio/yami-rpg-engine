<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiReference-properties-grid') || 'Reference Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiReference-properties-grid">
			<text>{{ local.getLabel('uiReference-prefabId') || 'Prefab' }}</text
			><CustomBox
				id="uiReference-prefabId"
				type="preset-element"
			></CustomBox>
			<text>{{ local.getLabel('uiReference-synchronous') || 'Synchronous' }}</text
			><CheckBox
				id="uiReference-synchronous"
				class="standard large"
			></CheckBox>
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

const ui = useUIStore();
const local = useLocalStore();

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
