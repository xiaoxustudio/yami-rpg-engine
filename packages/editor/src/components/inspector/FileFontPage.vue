<template>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileFont-info-grid.label') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileFont-info-grid">
			<div class="text">{{ t('components.fileFont-name.label') || 'Name' }}</div><div class="text" id="fileFont-name">{{ form.name }}</div> <div class="text">{{ t('components.fileFont-size.label') || 'Size' }}</div
			><div class="text" id="fileFont-size">{{ form.size }}</div>
		</div>
	</DetailBox>
	<DetailBox id="fileFont-font-detail" open>
		<DetailSummary>{{ t('components.fileFont-font-grid.label') || 'Font Preview' }}</DetailSummary>
		<div class="detail-grid" id="fileFont-font-grid">
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
import { useI18n } from 'vue-i18n';
import { useFileFontPage } from '@app/composables/useFileFontPage';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';

const { t } = useI18n();

const { form, sync } = useFileFontPage();

onMounted(() => {
	const fileFont = Inspector.fileFont;
	if (!fileFont) return;
	const previews = document.querySelectorAll('.fileFont-preview');
	fileFont.previews = previews;
	const el = document.getElementById('fileFont');
	if (el) {
		attachElementApi(el, { update: sync });
		el.addEventListener('resize', fileFont.windowResize);
	}
	sync();
});
</script>
