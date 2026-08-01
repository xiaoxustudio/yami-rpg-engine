<template>
			<page-frame id="animation-motion" value="animation-motion">
				<box id="animation-list-head">
					<text-box id="animation-searcher" name="search" />
				</box>
				<node-list id="animation-list" padded />
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
