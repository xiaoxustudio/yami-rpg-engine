<template>
	<!-- 文本建议列表 -->
	<TreeList id="text-suggestions" class="hidden" :node-icon-renderer="nodeIconRenderer" />
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import TreeList from '@app/components/common/TreeList.vue';

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { icon?: string };
	if (!node.icon) return [];
	return [h('span', { class: ['node-icon', node.icon] })];
};

onMounted(() => {});
</script>
