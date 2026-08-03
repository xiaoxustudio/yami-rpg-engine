<template>
			<div class="page-frame" id="animation-motion" value="animation-motion">
				<div class="box" id="animation-list-head">
					<TextBox id="animation-searcher" name="search" />
				</div>
				<TreeList id="animation-list" padded />
			</div>
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
