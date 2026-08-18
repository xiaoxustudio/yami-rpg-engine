<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileVideo-info-grid.label') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileVideo-info-grid">
			<div class="text">{{ t('components.fileVideo-name.label') || 'Name' }}</div><div class="text" id="fileVideo-name"></div> <div class="text">{{ t('components.fileVideo-size.label') || 'Size' }}</div
			><div class="text" id="fileVideo-size"></div> <div class="text">{{ t('components.fileVideo-duration.label') || 'Duration' }}</div
			><div class="text" id="fileVideo-duration"></div> <div class="text">{{ t('components.fileVideo-resolution.label') || 'Resolution' }}</div
			><div class="text" id="fileVideo-resolution"></div> <div class="text">{{ t('components.fileVideo-bitrate.label') || 'Bitrate' }}</div
			><div class="text" id="fileVideo-bitrate"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileVideo-video-detail" open>
		<DetailSummary>{{ t('components.fileVideo-video.label') || 'Player' }}</DetailSummary>
		<video id="fileVideo-video" controls="controls"></video>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileVideoPage } from '@app/composables/useFileVideoPage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const { t } = useI18n();

const { windowError } = useFileVideoPage();

onMounted(() => {
	const fileVideo = Inspector.fileVideo;
	if (fileVideo) {
		fileVideo.video = document.getElementById('fileVideo-video') as HTMLVideoElement;
	}
	window.addEventListener('error', windowError);
});
</script>
