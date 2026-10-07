<template>
	<TreeList
		id="text-suggestions"
		:ref="registryRef(textSuggestionEls, 'text-suggestions')"
		class="hidden"
		:node-icon-renderer="nodeIconRenderer"
	/>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import TreeList from '@app/components/common/TreeList.vue';
import { textSuggestionEls } from '@app/commands/text-tip';
import { registryRef } from '@app/utils/element-registry';

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { icon?: string };
	if (!node.icon) return [];
	return [h('span', { class: ['node-icon', node.icon] })];
};

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
