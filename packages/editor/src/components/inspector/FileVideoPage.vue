<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileVideo-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileVideo-info-grid">
			<div class="text">{{ t('components.fileVideo-name.label') || 'Name' }}</div>
			<div class="text" id="fileVideo-name"
				v-tip="t('components.fileVideo-name.tip')">{{ form.name }}</div>
			<div class="text">{{ t('components.fileVideo-size.label') || 'Size' }}</div>
			<div class="text" id="fileVideo-size"
				v-tip="t('components.fileVideo-size.tip')">{{ form.size }}</div>
			<div class="text">{{ t('components.fileVideo-duration.label') || 'Duration' }}</div>
			<div class="text" id="fileVideo-duration"
				v-tip="t('components.fileVideo-duration.tip')">{{ form.duration }}</div>
			<div class="text">{{ t('components.fileVideo-resolution.label') || 'Resolution' }}</div>
			<div class="text" id="fileVideo-resolution"
				v-tip="t('components.fileVideo-resolution.tip')">{{ form.resolution }}</div>
			<div class="text">{{ t('components.fileVideo-bitrate.label') || 'Bitrate' }}</div>
			<div class="text" id="fileVideo-bitrate"
				v-tip="t('components.fileVideo-bitrate.tip')">{{ form.bitrate }}</div>
		</div>
	</DetailBox>
	<DetailBox id="fileVideo-video-detail" open>
		<DetailSummary>{{ t('components.fileVideo-video.label') || 'Player' }}</DetailSummary>
		<video id="fileVideo-video" ref="elVideo" :controls="true"></video>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref , onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useFileVideoPage } from '@app/composables/useFileVideoPage';
import { Inspector } from '@app/inspector/inspector.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const { t } = useI18n();

const { form, sync, windowError } = useFileVideoPage();

const elVideo = ref<HTMLVideoElement | null>(null);

let windowErrorHandler: ((event: Event) => void) | null = null;

onMounted(() => {
	const fileVideo = Inspector.fileVideo;
	if (fileVideo) {
		fileVideo.video = elVideo.value;
	}
	// E1：存变量再 add/remove（原先只 add）
	windowErrorHandler = windowError;
	window.addEventListener('error', windowErrorHandler);
	const el = inspectorEls.get('fileVideo');
	if (el) {
		attachElementApi(el, { update: sync });
	}
	sync();
});
onBeforeUnmount(() => {
	if (windowErrorHandler) window.removeEventListener('error', windowErrorHandler);
});
</script>

<style>
/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileVideo-video-detail {
	flex-grow: 1;
}

#fileVideo-video {
	display: block;
	position: relative;
	width: 100%;
	height: calc(100% - 22px);
}
</style>

