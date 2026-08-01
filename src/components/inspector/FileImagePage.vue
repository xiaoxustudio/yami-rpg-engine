<template>
	<detail-box open>
		<detail-summary>{{ local.getLabel('fileImage-info-grid') || 'File Info' }}</detail-summary>
		<detail-grid id="fileImage-info-grid">
			<text>{{ local.getLabel('fileImage-name') || 'Name' }}</text><text id="fileImage-name"></text> <text>{{ local.getLabel('fileImage-size') || 'Size' }}</text
			><text id="fileImage-size"></text> <text>{{ local.getLabel('fileImage-resolution') || 'Resolution' }}</text
			><text id="fileImage-resolution"></text>
		</detail-grid>
	</detail-box>
	<detail-box id="fileImage-image-detail" open>
		<detail-summary>{{ local.getLabel('fileImage-image-viewer') || 'Image' }}</detail-summary>
		<box id="fileImage-image-viewer">
			<img id="fileImage-image" />
		</box>
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
