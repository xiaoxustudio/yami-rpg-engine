<template>
	<DetailBox open>
		<DetailSummary>{{
			t('components.fileScript-info-grid.label') || 'File Info'
		}}</DetailSummary>
		<div class="detail-grid" id="fileScript-info-grid">
			<div class="text">{{ t('components.fileScript-name.label') || 'Name' }}</div>
			<div class="text" id="fileScript-name">{{ form.name }}</div>
			<div class="text">{{ t('components.fileScript-size.label') || 'Size' }}</div>
			<div class="text" id="fileScript-size">{{ form.size }}</div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ t('components.fileScript-overview.label') || 'Overview' }}</DetailSummary>
		<div class="box" id="fileScript-overview" ref="overviewEl">
			<PluginOverview :meta="overviewMeta" detailed />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
/* oxlint-disable eslint/no-restricted-properties */
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFileScriptPage } from '@app/composables/useFileScriptPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { Inspector } from '@app/inspector/inspector.ts';
import type { PluginMetaShape } from '@app/plugin/plugin.ts';
import PluginOverview from '@app/components/tools/PluginOverview.vue';

const { t } = useI18n();

const { form, sync } = useFileScriptPage();

const overviewEl = ref<HTMLElement | null>(null);
const overviewMeta = ref<PluginMetaShape | null>(null);

const syncOverview = (): void => {
	overviewMeta.value = Inspector.fileScript?.meta ?? null;
};

onMounted(() => {
	const fileScript = Inspector.fileScript;
	if (fileScript) {
		fileScript.overview = document.getElementById('fileScript-overview');
	}
	overviewEl.value?.addEventListener('update', syncOverview);
	if (fileScript) {
		window.addEventListener('localize', fileScript.windowLocalize);
	}
	const el = document.getElementById('fileScript');
	if (el) {
		attachElementApi(el, { update: sync });
	}
	sync();
});
</script>
