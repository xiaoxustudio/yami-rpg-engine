<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileImage-info-grid.label') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileImage-info-grid">
			<div class="text">{{ t('components.fileImage-name.label') || 'Name' }}</div><div class="text" id="fileImage-name"></div> <div class="text">{{ t('components.fileImage-size.label') || 'Size' }}</div
			><div class="text" id="fileImage-size"></div> <div class="text">{{ t('components.fileImage-resolution.label') || 'Resolution' }}</div
			><div class="text" id="fileImage-resolution"></div>
		</div>
	</DetailBox>
	<DetailBox id="fileImage-image-detail" open>
		<DetailSummary>{{ t('components.fileImage-image-viewer.label') || 'Image' }}</DetailSummary>
		<div class="box" id="fileImage-image-viewer">
			<img id="fileImage-image" />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileImagePage } from '@app/composables/useFileImagePage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const { t } = useI18n();

const { updateImage, windowResize } = useFileImagePage();

onMounted(() => {
	const fileImage = Inspector.fileImage;
	if (fileImage) {
		fileImage.image = document.getElementById('fileImage-image') as HTMLImageElement | null;
	}

	const el = document.getElementById('fileImage');
	if (!el) return;
	attachElementApi(el, { updateImage });
	el.addEventListener('resize', windowResize);
	document.getElementById('fileImage-image-detail')?.on?.('toggle', windowResize);
});
</script>
