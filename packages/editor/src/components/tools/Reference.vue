<template>
		<WindowFrame id="reference" no-buttons>
		<template #title><TitleBar>Reference<div class="close"></div></TitleBar></template>
		
			<CommonList id="reference-list" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, render, type VNode } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CommonList from '@app/components/common/CommonList.vue';
import { registerReferenceUpdate, type ReferenceItem } from '@app/legacy/log/related-references.ts';
import { $ } from '@app/utils/dom';

const inspector = useInspectorStore();
const local = useLocalStore();

const updateItems = (items: ReferenceItem[]): void => {
	const list = $('#reference-list') as HTMLElement & {
		reload(): void;
		appendElement(element: HTMLElement): void;
		update(): void;
	};
	if (!list) return;
	list.reload();
	for (const item of items) {
		const nodes: Array<string | VNode> = [item.text];
		if ('count' in item && item.count !== undefined && item.count > 1) {
			nodes.push(h('div', { class: 'reference-count text' }, String(item.count)));
		}
		const host = document.createElement('div');
		render(
			h(
				'common-item',
				{
					'.dataValue': item,
					class: { 'reference-comment': item.type === 'comment' }
				},
				nodes
			),
			host
		);
		const element = host.firstElementChild as HTMLElement;
		host.removeChild(element);
		list.appendElement(element);
	}
	list.update();
};

onMounted(() => {
	registerReferenceUpdate(updateItems);


});
</script>
