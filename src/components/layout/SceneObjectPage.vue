<template>
			<page-frame id="scene-object" value="scene-object">
				<box id="scene-list-head">
					<text-box id="scene-searcher" name="search" />
				</box>
				<node-list id="scene-list" padded />
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
