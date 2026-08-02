<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScript-info-grid') || 'File Info' }}</DetailSummary>
		<detail-grid id="fileScript-info-grid">
			<text>{{ local.getLabel('fileScript-name') || 'Name' }}</text><text id="fileScript-name"></text> <text>{{ local.getLabel('fileScript-size') || 'Size' }}</text
			><text id="fileScript-size"></text>
		</detail-grid>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScript-overview') || 'Overview' }}</DetailSummary>
		<box id="fileScript-overview"></box>
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
