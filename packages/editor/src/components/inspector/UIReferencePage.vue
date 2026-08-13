<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('uiReference-properties-grid') || 'Reference Properties' }}</DetailSummary>
		<div class="detail-grid" id="uiReference-properties-grid">
			<div class="text">{{ local.getLabel('uiReference-prefabId') || 'Prefab' }}</div
			><CustomBox
				id="uiReference-prefabId"
				type="preset-element"
				@input="onParamInput"
			></CustomBox>
			<div class="text">{{ local.getLabel('uiReference-synchronous') || 'Synchronous' }}</div
			><CheckBox
				id="uiReference-synchronous"
				class="standard large"
				@input="onParamInput"
			></CheckBox>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Inspector } from '@/inspector/inspector.ts';
import { useUIStore } from '@app/stores/ui';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import CheckBox from '@app/components/common/CheckBox.vue';
import CustomBox from '@app/components/common/CustomBox.vue';

const ui = useUIStore();
const local = useLocalStore();

const onParamInput = (event: Event) => {
	const target = event?.target ?? document.activeElement;
	Inspector?.uiReference?.paramInput?.({ target });
};

onMounted(() => {
	ui.syncState();
	local.syncState();
});
</script>
