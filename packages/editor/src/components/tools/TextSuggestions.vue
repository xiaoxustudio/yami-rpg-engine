<template>
	<TreeList
		id="text-suggestions"
		:ref="bind('suggestions')"
		class="hidden"
		:node-icon-renderer="nodeIconRenderer"
	/>
</template>

<script setup lang="ts">
import { h, onMounted, onUnmounted, type VNode } from 'vue';
import TreeList from '@app/components/common/TreeList.vue';
import { textSuggestionNodes } from '@app/composables/suggestion-nodes';

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { icon?: string };
	if (!node.icon) return [];
	return [h('span', { class: ['node-icon', node.icon] })];
};

const { bind, dispose } = textSuggestionNodes.scoped();
onUnmounted(dispose);

onMounted(() => {});
</script>

<style>
#text-suggestions {
	display: block;
	position: fixed;
	margin-left: var(--1dpx);

	background-color: var(--suggestion-widget-background);
	outline: var(--window-outline);
	pointer-events: visible;
}
</style>
