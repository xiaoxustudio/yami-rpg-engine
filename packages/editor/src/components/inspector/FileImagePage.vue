<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileImage-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileImage-info-grid">
			<div class="text">{{ t('components.fileImage-name.label') || 'Name' }}</div>
			<div class="text" id="fileImage-name" v-tip="t('components.fileImage-name.tip')">
				{{ form.name }}
			</div>
			<div class="text">{{ t('components.fileImage-size.label') || 'Size' }}</div>
			<div class="text" id="fileImage-size" v-tip="t('components.fileImage-size.tip')">
				{{ form.size }}
			</div>
			<div class="text">{{ t('components.fileImage-resolution.label') || 'Resolution' }}</div>
			<div
				class="text"
				id="fileImage-resolution"
				v-tip="t('components.fileImage-resolution.tip')"
			>
				{{ form.resolution }}
			</div>
		</div>
	</DetailBox>
	<DetailBox id="fileImage-image-detail" open @toggle="windowResize">
		<DetailSummary>{{ t('components.fileImage-image-viewer.label') || 'Image' }}</DetailSummary>
		<div class="box" id="fileImage-image-viewer">
			<img id="fileImage-image" ref="elImage" alt="" />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { inspectorPageRoots } from '@app/composables/inspector-page-nodes';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { onMounted, ref, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileImagePage } from '@app/composables/useFileImagePage';
import { Inspector } from '@app/inspector/inspector.ts';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const { t } = useI18n();

const { form, sync, updateImage, windowResize } = useFileImagePage();

const elImage = ref<HTMLImageElement | null>(null);

onMounted(() => {
	const fileImage = Inspector.fileImage;
	if (fileImage) {
		fileImage.image = elImage.value;
	}

	// 页面根由 PageManager 渲染：按 DOM id 取（不再按 id 摸 inspectorEls）
	const el = inspectorPageRoots.pick('fileImage');
	const bridgeApi: PageSyncApi = { sync, updateImage };
	inspectorPageSync.fileImage.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.fileImage.reset(bridgeApi));
	if (!el) return;
	el.addEventListener('resize', windowResize);
	sync();
});
</script>

<style>
#fileImage-image-detail {
	flex-grow: 1;
}

#fileImage-image-viewer {
	display: block;
	position: relative;
	width: 100%;
	height: calc(100% - 22px);
	overflow: hidden;
}

#fileImage-image {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
	outline: var(--window-outline);
}
</style>
