<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileVideo-info-grid') || 'File Info' }}</DetailSummary>
		<detail-grid id="fileVideo-info-grid">
			<text>{{ local.getLabel('fileVideo-name') || 'Name' }}</text><text id="fileVideo-name"></text> <text>{{ local.getLabel('fileVideo-size') || 'Size' }}</text
			><text id="fileVideo-size"></text> <text>{{ local.getLabel('fileVideo-duration') || 'Duration' }}</text
			><text id="fileVideo-duration"></text> <text>{{ local.getLabel('fileVideo-resolution') || 'Resolution' }}</text
			><text id="fileVideo-resolution"></text> <text>{{ local.getLabel('fileVideo-bitrate') || 'Bitrate' }}</text
			><text id="fileVideo-bitrate"></text>
		</detail-grid>
	</DetailBox>
	<DetailBox id="fileVideo-video-detail" open>
		<DetailSummary>{{ local.getLabel('fileVideo-video') || 'Player' }}</DetailSummary>
		<video id="fileVideo-video" controls="controls"></video>
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
