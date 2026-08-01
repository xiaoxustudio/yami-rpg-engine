<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileScript-info-grid') || 'File Info' }}</detail-summary>
		<detail-grid id="fileScript-info-grid">
			<text>{{ local.getLabel('fileScript-name') || 'Name' }}</text><text id="fileScript-name"></text> <text>{{ local.getLabel('fileScript-size') || 'Size' }}</text
			><text id="fileScript-size"></text>
		</detail-grid>
	</detail-box>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileScript-overview') || 'Overview' }}</detail-summary>
		<box id="fileScript-overview"></box>
	</detail-box>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
