<template>
			<page-frame id="ui-element" value="ui-element">
				<box id="ui-list-head">
					<text-box id="ui-searcher" name="search" />
				</box>
				<node-list id="ui-list" padded />
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
