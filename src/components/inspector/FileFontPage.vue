<template>
	<DetailBox open>
		<DetailSummary>{{ local.getLabel('fileFont-info-grid') || 'File Info' }}</DetailSummary>
		<detail-grid id="fileFont-info-grid">
			<text>{{ local.getLabel('fileFont-name') || 'Name' }}</text><text id="fileFont-name"></text> <text>{{ local.getLabel('fileFont-size') || 'Size' }}</text
			><text id="fileFont-size"></text>
		</detail-grid>
	</DetailBox>
	<DetailBox id="fileFont-font-detail" open>
		<DetailSummary>{{ local.getLabel('fileFont-font-grid') || 'Font Preview' }}</DetailSummary>
		<detail-grid id="fileFont-font-grid">
			<TextBox id="fileFont-content" />
			<text id="fileFont-12px" class="fileFont-preview"></text>
			<text id="fileFont-18px" class="fileFont-preview"></text>
			<text id="fileFont-24px" class="fileFont-preview"></text>
			<text id="fileFont-36px" class="fileFont-preview"></text>
			<text id="fileFont-48px" class="fileFont-preview"></text>
			<text id="fileFont-60px" class="fileFont-preview"></text>
			<text id="fileFont-72px" class="fileFont-preview"></text>
		</detail-grid>
	</DetailBox>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
