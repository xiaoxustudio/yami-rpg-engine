<template>
	<!-- 文本建议列表 -->
	<TreeList id="text-suggestions" class="hidden" :node-content="nodeContent" />
</template>

<script setup lang="ts">
import { h, type VNode } from 'vue';
import TreeList from '@app/components/common/TreeList.vue';

interface SuggestionItem {
	name: string;
	class?: string;
	comment?: string;
	refCount?: number;
}

const nodeContent = (item: unknown): VNode[] => {
	const node = item as SuggestionItem;
	const nodes: VNode[] = [];
	const classList = ['text-suggestion-content', 'text'];
	if (node.class) classList.push(node.class);
	nodes.push(h('div', { class: classList }, node.name));
	if (node.refCount) {
		nodes.push(h('div', { class: 'text-suggestion-ref-count text' }, String(node.refCount)));
	}
	if (node.comment) {
		nodes.push(h('div', { class: 'text-suggestion-comment text' }, node.comment));
	}
	return nodes;
};
</script>
