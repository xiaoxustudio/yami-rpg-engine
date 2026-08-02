<template>
			<page-frame id="ui-element" value="ui-element">
				<box id="ui-list-head">
					<TextBox id="ui-searcher" name="search" />
				</box>
				<TreeList id="ui-list" padded />
			</page-frame>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
