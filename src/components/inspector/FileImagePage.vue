<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileImage-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileImage-info-grid">
			<div class="text">{{ local.getLabel('fileImage-name') || 'Name' }}</div><div class="text" id="fileImage-name"></div> <div class="text">{{ local.getLabel('fileImage-size') || 'Size' }}</div
			><div class="text" id="fileImage-size"></div> <div class="text">{{ local.getLabel('fileImage-resolution') || 'Resolution' }}</div
			><div class="text" id="fileImage-resolution"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileImage-image-detail" open>
		<DetailSummary>{{ local.getLabel('fileImage-image-viewer') || 'Image' }}</DetailSummary>
		<div class="box" id="fileImage-image-viewer">
			<img id="fileImage-image" />
		</div>
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
