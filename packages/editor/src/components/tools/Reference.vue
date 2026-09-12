<template>
	<WindowFrame id="reference"
				:ref="registryRef(logEls, 'reference')" no-buttons>
		<template #title
			><TitleBar
				>Reference
				<div class="close"></div></TitleBar
		></template>

		<CommonList id="reference-list"
				:ref="registryRef(fieldEls, 'reference-list')" />
	</WindowFrame>
</template>

<script setup lang="ts">
import { createElementRegistry, registerElement, registryRef } from '@app/utils/element-registry';
import { logEls } from '@app/log/element-registry';

// P5b 批次 4：本组件的控件元素注册表（替代按 id 查 DOM）
const fieldEls = createElementRegistry();
/* oxlint-disable eslint/no-restricted-properties */
import { h, onMounted, render, type VNode } from 'vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CommonList from '@app/components/common/CommonList.vue';
import { registerReferenceUpdate, type ReferenceItem } from '@app/log/related-references.ts';

const updateItems = (items: ReferenceItem[]): void => {
	const list = fieldEls.get('reference-list') as HTMLElement & {
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
				'div',
				{
					'.dataValue': item,
					class: { 'common-item': true, 'reference-comment': item.type === 'comment' }
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
	// 模块（related-references.ts）从 logEls 读 #reference-list → 由本组件镜像登记
	registerElement(logEls, 'reference-list', fieldEls.get('reference-list'));
	registerReferenceUpdate(updateItems);
});
</script>

<style>
/* 窗口样式迁移：由 Project/css/dialogs.css 迁入组件（选择器为全局 id，不能用 scoped） */
#reference {
	width: 800px;
	height: 600px;
}

#reference-list {
	position: absolute;
	left: 10px;
	top: 10px;
	right: 10px;
	bottom: 10px;
	background-color: var(--input-background);
	border: var(--input-border);
	border-radius: 2px;
}
</style>

