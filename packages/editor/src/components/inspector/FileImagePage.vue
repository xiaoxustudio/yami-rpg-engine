<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileImage-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileImage-info-grid">
			<div class="text">{{ t('components.fileImage-name.label') || 'Name' }}</div>
			<div class="text" id="fileImage-name"
				v-tip="t('components.fileImage-name.tip')">{{ form.name }}</div>
			<div class="text">{{ t('components.fileImage-size.label') || 'Size' }}</div>
			<div class="text" id="fileImage-size"
				v-tip="t('components.fileImage-size.tip')">{{ form.size }}</div>
			<div class="text">{{ t('components.fileImage-resolution.label') || 'Resolution' }}</div>
			<div class="text" id="fileImage-resolution"
				v-tip="t('components.fileImage-resolution.tip')">{{ form.resolution }}</div>
		</div>
	</DetailBox>
	<DetailBox id="fileImage-image-detail" ref="elImageDetail" open>
		<DetailSummary>{{ t('components.fileImage-image-viewer.label') || 'Image' }}</DetailSummary>
		<div class="box" id="fileImage-image-viewer">
			<img id="fileImage-image" ref="elImage" />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileImagePage } from '@app/composables/useFileImagePage';
import { Inspector } from '@app/inspector/inspector.ts';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registerElement } from '@app/utils/element-registry';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';

const { t } = useI18n();

const { form, sync, updateImage, windowResize } = useFileImagePage();

const elImage = ref<HTMLImageElement | null>(null);
const elImageDetail = ref<InstanceType<typeof DetailBox> | null>(null);

onMounted(() => {
	const fileImage = Inspector.fileImage;
	if (fileImage) {
		fileImage.image = elImage.value;
	}

	// P1b：具名 ref 占用了 `:ref` 槽位 → 命令式登记（模块侧读注册表取图元素）
	registerElement(inspectorEls, 'fileImage-image', elImage.value);

	const el = inspectorEls.get('fileImage');
	if (!el) return;
	attachElementApi(el, { updateImage, update: sync });
	el.addEventListener('resize', windowResize);
	elImageDetail.value?.on('toggle', windowResize);
	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
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

