<template>
	<TreeList
		id="command-suggestions"
		:ref="registryRef(commandSuggestionEls, 'command-suggestions')"
		class="hidden"
		:node-extras="nodeExtras"
		:node-icon-renderer="nodeIconRenderer"
	/>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useLocalStore } from '@app/stores/local';
import { commandSuggestionEls } from '@app/commands/command-tip';
import { registryRef } from '@app/utils/element-registry';
import TreeList from '@app/components/common/TreeList.vue';

const local = getLocalStore();

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	return [
		h('span', {
			class: [
				'node-icon',
				node.class === 'folder' ? 'icon-folder' : `icon-command ${node.class ?? ''}`
			]
		})
	];
};

const nodeExtras = (item: unknown): VNode[] => {
	const node = item as { class?: string; value?: string; keywords?: string };
	const nodes: VNode[] = [];
	if (node.class !== 'folder' && !local.language.startsWith('en')) {
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

onMounted(() => {});
</script>
