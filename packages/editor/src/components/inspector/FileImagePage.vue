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
import { useFileImagePage } from '@app/composables/useFileImagePage';
import { useLocalStore } from '@app/stores/local';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { attachElementApi } from '@app/legacy/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const local = useLocalStore();

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
