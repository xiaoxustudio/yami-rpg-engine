<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileFont-info-grid.label') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileFont-info-grid">
			<div class="text">{{ t('components.fileFont-name.label') || 'Name' }}</div>
			<div class="text" id="fileFont-name"
				v-tip="t('components.fileFont-name.tip')">{{ form.name }}</div>
			<div class="text">{{ t('components.fileFont-size.label') || 'Size' }}</div>
			<div class="text" id="fileFont-size"
				v-tip="t('components.fileFont-size.tip')">{{ form.size }}</div>
		</div>
	</DetailBox>
	<DetailBox id="fileFont-font-detail" open>
		<DetailSummary>{{
			t('components.fileFont-font-grid.label') || 'Font Preview'
		}}</DetailSummary>
		<div class="detail-grid" id="fileFont-font-grid"
				:ref="registryRef(inspectorEls, 'fileFont-font-grid')">
			<TextBox id="fileFont-content" v-model="form.text" />
			<div class="text fileFont-preview" id="fileFont-12px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-18px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-24px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-36px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-48px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-60px">{{ form.text }}</div>
			<div class="text fileFont-preview" id="fileFont-72px">{{ form.text }}</div>
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryRef, registryElements } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { useFileFontPage } from '@app/composables/useFileFontPage';
import { Inspector } from '@app/inspector/inspector.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, sync } = useFileFontPage();

onMounted(() => {
	const fileFont = Inspector.fileFont;
	if (!fileFont) return;
	const previews = registryElements(inspectorEls, []);
	fileFont.previews = previews;
	const el = inspectorEls.get('fileFont');
	if (el) {
		attachElementApi(el, { update: sync });
		el.addEventListener('resize', fileFont.windowResize);
	}
	sync();
});
</script>

<style>
/* 样式迁移：由 Project/css/inspector.css 迁入组件（选择器为全局 id，不能用 scoped） */
#fileFont-font-grid {
	grid-gap: 20px;
	grid-template-columns: 1fr;
}

#fileFont-content {
	font-size: 12px;
}

#fileFont-12px {
	line-height: 1em;
	font-size: 1em;
}

#fileFont-18px {
	font-size: 1.5em;
	line-height: 1em;
}

#fileFont-24px {
	font-size: 2em;
	line-height: 1em;
}

#fileFont-36px {
	font-size: 3em;
	line-height: 1em;
}

#fileFont-48px {
	font-size: 4em;
	line-height: 1em;
}

#fileFont-60px {
	font-size: 5em;
	line-height: 1em;
}

#fileFont-72px {
	font-size: 6em;
	line-height: 1em;
}
</style>

