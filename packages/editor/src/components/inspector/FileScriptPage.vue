<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScript-info-grid') || 'File Info' }}</DetailSummary>
		<div class="detail-grid" id="fileScript-info-grid">
			<div class="text">{{ local.getLabel('fileScript-name') || 'Name' }}</div><div class="text" id="fileScript-name"></div> <div class="text">{{ local.getLabel('fileScript-size') || 'Size' }}</div
			><div class="text" id="fileScript-size"></div>
		</div>
	</DetailBox>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileScript-overview') || 'Overview' }}</DetailSummary>
		<div class="box" id="fileScript-overview" ref="overviewEl">
			<PluginOverview :meta="overviewMeta" detailed />
		</div>
	</DetailBox>
</template>

<script setup lang="ts">
import '@app/legacy/inspector/file-script-page.ts';
import { onMounted, ref } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import { Inspector } from '@app/legacy/inspector/inspector.ts';
import type { PluginMetaShape } from '@app/legacy/plugin/plugin.ts';
import PluginOverview from '@app/components/tools/PluginOverview.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const overviewEl = ref<HTMLElement | null>(null);
const overviewMeta = ref<PluginMetaShape | null>(null);

const syncOverview = (): void => {
	overviewMeta.value = Inspector.fileScript?.meta ?? null;
};

onMounted(() => {


	overviewEl.value?.addEventListener('update', syncOverview);
});
</script>
