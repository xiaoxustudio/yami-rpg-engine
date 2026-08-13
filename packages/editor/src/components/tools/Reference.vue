<template>
		<WindowFrame id="reference" no-buttons>
		<template #title><TitleBar>Reference<div class="close"></div></TitleBar></template>
		
			<CommonList id="reference-list" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { Fragment, h, onMounted, render, type VNode } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CommonList from '@app/components/common/CommonList.vue';
import { registerReferenceUpdate, type ReferenceItem } from '@/log/related-references.ts';
import { $ } from '@/util/dom.ts';

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
		const li = document.createElement('common-item');
		Object.defineProperty(li, 'dataValue', {
			configurable: true,
			get: () => item
		});
		const nodes: Array<string | VNode> = [item.text];
		if ('count' in item && item.count !== undefined && item.count > 1) {
			nodes.push(h('div', { class: 'reference-count text' }, String(item.count)));
		}
		render(h(Fragment, nodes), li);
		if (item.type === 'comment') {
			li.classList.add('reference-comment');
		}
		list.appendElement(li);
	}
	list.update();
};

onMounted(() => {
	registerReferenceUpdate(updateItems);
	inspector.syncState();
	local.syncState();
});
</script>
