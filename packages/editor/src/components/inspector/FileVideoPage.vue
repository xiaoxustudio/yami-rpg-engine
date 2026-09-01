<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileVideo-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileVideo-info-grid">
			<div class="text">{{ t('components.fileVideo-name.label') || 'Name' }}</div>
			<div class="text" id="fileVideo-name">{{ form.name }}</div>
			<div class="text">{{ t('components.fileVideo-size.label') || 'Size' }}</div>
			<div class="text" id="fileVideo-size">{{ form.size }}</div>
			<div class="text">{{ t('components.fileVideo-duration.label') || 'Duration' }}</div>
			<div class="text" id="fileVideo-duration">{{ form.duration }}</div>
			<div class="text">{{ t('components.fileVideo-resolution.label') || 'Resolution' }}</div>
			<div class="text" id="fileVideo-resolution">{{ form.resolution }}</div>
			<div class="text">{{ t('components.fileVideo-bitrate.label') || 'Bitrate' }}</div>
			<div class="text" id="fileVideo-bitrate">{{ form.bitrate }}</div>
		</div>
	</DetailBox>
	<DetailBox id="fileVideo-video-detail" open>
		<DetailSummary>{{ t('components.fileVideo-video.label') || 'Player' }}</DetailSummary>
		<video id="fileVideo-video" ref="elVideo" controls="controls"></video>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileVideoPage } from '@app/composables/useFileVideoPage';
import { Inspector } from '@app/inspector/inspector.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const { t } = useI18n();

const { form, sync, windowError } = useFileVideoPage();

const elVideo = ref<HTMLVideoElement | null>(null);

onMounted(() => {
	const fileVideo = Inspector.fileVideo;
	if (fileVideo) {
		fileVideo.video = elVideo.value;
	}
	window.addEventListener('error', windowError);
	const el = document.getElementById('fileVideo');
	if (el) {
		attachElementApi(el, { update: sync });
	}
	sync();
});
</script>
