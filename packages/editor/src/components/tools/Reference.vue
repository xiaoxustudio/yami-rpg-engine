<template>
	<WindowFrame id="reference" ref="frame" no-buttons @closed="onWindowClosed">
		<template #title
			><TitleBar
				>Reference
				<div class="close"></div></TitleBar
		></template>

		<CommonList id="reference-list" ref="listRef" />
	</WindowFrame>
</template>

<script setup lang="ts">
import {
	provideReference,
	resetReference,
	type ReferenceApi
} from '@app/composables/tool-window-bridges';
import { h, onMounted, onUnmounted, ref, type VNode } from 'vue';
import { renderDetached } from '@app/utils/dom';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CommonList from '@app/components/common/CommonList.vue';
import {
	Reference,
	registerReferenceUpdate,
	type ReferenceItem
} from '@app/log/related-references.ts';
import { on } from '@app/utils/element-utils';

const updateItems = (items: ReferenceItem[]): void => {
	// 控件能力只在**组件实例**上（元素上不再挂 reload/appendElement/update）：
	// `listRef` 就是 editor `CommonList` 包装层实例，方法直接调，不再按元素反查。
	const list = listRef.value;
	if (!list) return;
	list.reload();
	for (const item of items) {
		const nodes: Array<string | VNode> = [item.text];
		if ('count' in item && item.count !== undefined && item.count > 1) {
			nodes.push(h('div', { class: 'reference-count text' }, String(item.count)));
		}
		const element = renderDetached(
			h(
				'div',
				{
					'.dataValue': item,
					class: { 'common-item': true, 'reference-comment': item.type === 'comment' }
				},
				nodes
			)
		);
		list.appendElement(element);
	}
	list.update();
};

const listRef = ref<InstanceType<typeof CommonList> | null>(null);

const bridgeApi: ReferenceApi = {
	clearList: () => {
		listRef.value?.clear?.();
	}
};

/** 关闭时通知单例（原来靠注册表取根元素挂监听）。 */
const onWindowClosed = (): void => {
	Reference.windowClosed?.(new Event('closed'));
};

onMounted(() => {
	provideReference(bridgeApi);
	onUnmounted(() => resetReference(bridgeApi));
	registerReferenceUpdate(updateItems);
	const root = listRef.value?.root ?? null;
	if (root)
		on(root, 'popup', (event) =>
			Reference.listPopup?.(event as PointerEvent & { value?: never })
		);
});
</script>

<style>
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
