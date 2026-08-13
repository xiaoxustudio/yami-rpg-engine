<template>
	<TreeList id="command-suggestions" class="hidden" :node-extras="nodeExtras" />
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { Local } from '@/tools/localization.ts';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown): VNode[] => {
	const node = item as { class?: string; value?: string; keywords?: string };
	const nodes: VNode[] = [];
	if (node.class !== 'folder' && !Local.language.startsWith('en')) {
		const string = node.class === 'custom' ? (node.keywords ?? node.value) : node.value;
		if (string) {
			nodes.push(
				h(
					'div',
					{ class: 'command-suggestion-comment text' },
					string.charAt(0).toUpperCase() + string.slice(1)
				)
			);
		}
	}
	return nodes;
};

onMounted(() => {
	inspector.syncState();
	local.syncState();
});
</script>
