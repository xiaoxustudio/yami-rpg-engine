<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileVideo-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileVideo-info-grid">
			<div class="text">{{ local.getLabel('fileVideo-name') || 'Name' }}</div><div class="text" id="fileVideo-name"></div> <div class="text">{{ local.getLabel('fileVideo-size') || 'Size' }}</div
			><div class="text" id="fileVideo-size"></div> <div class="text">{{ local.getLabel('fileVideo-duration') || 'Duration' }}</div
			><div class="text" id="fileVideo-duration"></div> <div class="text">{{ local.getLabel('fileVideo-resolution') || 'Resolution' }}</div
			><div class="text" id="fileVideo-resolution"></div> <div class="text">{{ local.getLabel('fileVideo-bitrate') || 'Bitrate' }}</div
			><div class="text" id="fileVideo-bitrate"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileVideo-video-detail" open>
		<DetailSummary>{{ local.getLabel('fileVideo-video') || 'Player' }}</DetailSummary>
		<video id="fileVideo-video" controls="controls"></video>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFileVideoPage } from '@app/composables/useFileVideoPage';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const local = useLocalStore();

const { windowError } = useFileVideoPage();

onMounted(() => {
	window.addEventListener('error', windowError);
});
</script>
