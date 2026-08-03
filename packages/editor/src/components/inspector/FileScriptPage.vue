<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScript-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileScript-info-grid">
			<div class="text">{{ local.getLabel('fileScript-name') || 'Name' }}</div><div class="text" id="fileScript-name"></div> <div class="text">{{ local.getLabel('fileScript-size') || 'Size' }}</div
			><div class="text" id="fileScript-size"></div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScript-overview') || 'Overview' }}</DetailSummary>
		<div class="box" id="fileScript-overview"></div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
