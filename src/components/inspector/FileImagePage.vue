<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileImage-info-grid') || 'File Info' }}</DetailSummary>
		<detail-grid id="fileImage-info-grid">
			<text>{{ local.getLabel('fileImage-name') || 'Name' }}</text><text id="fileImage-name"></text> <text>{{ local.getLabel('fileImage-size') || 'Size' }}</text
			><text id="fileImage-size"></text> <text>{{ local.getLabel('fileImage-resolution') || 'Resolution' }}</text
			><text id="fileImage-resolution"></text>
		</detail-grid>
	</DetailBox>
	<DetailBox id="fileImage-image-detail" open>
		<DetailSummary>{{ local.getLabel('fileImage-image-viewer') || 'Image' }}</DetailSummary>
		<box id="fileImage-image-viewer">
			<img id="fileImage-image" />
		</box>
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
