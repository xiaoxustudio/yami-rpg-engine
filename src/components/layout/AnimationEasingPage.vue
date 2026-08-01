<template>
			<page-frame id="animation-easing" value="animation-easing">
				<box id="animation-easing-head">
					<item id="animation-easing-settings" class="toolbar-item" value="bezier" />
					<select-box id="animation-easing-id" />
				</box>
				<canvas id="animation-easing-canvas" width="0" height="0"></canvas>
			</page-frame>
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
