<template>
	<WindowFrame id="localization" show-apply mode="center" @apply="onApply">
		<template #title><TitleBar>Localization<div class="close"></div></TitleBar></template>
		
			<div class="field-set input pad" id="localization-list-fieldset">
				<div class="legend">List</div>
				<TreeList
					id="localization-list"
					padded
					:node-extras="nodeExtras"
					:node-icon-renderer="nodeIconRenderer"
					@select="onListSelect"
					@record="onListRecord"
					@open="onListOpen"
					@popup="onListPopup"
				/>
			</div>
			<div class="box" id="localization-inspector" />
			<TextBox id="localization-searcher" name="search" />
			<button id="localization-from-excel" name="from-excel">from-excel</button>
			<button id="localization-to-excel" name="to-excel">to-excel</button>
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { Localization } from '@app/legacy/local/local-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { class?: string; name?: string; contents?: Record<string, string> };
	const nodes: VNode[] = [];
	const element = container.parentNode as HTMLElement | null;
	element?.classList.add('localization-item');
	if (node.class === 'folder') {
		return nodes;
	}
	element?.classList.add('reference');
	let value = '';
	for (const key of Object.keys(node.contents ?? {})) {
		if (node.contents?.[key]) {
			value = node.contents[key];
			break;
		}
	}
	if (node.name) {
		if (value) {
			value = ` = ${value}`;
		}
	} else if (!value) {
		value = 'Text';
	}
	nodes.push(h('div', { class: 'localization-init-text text' }, value));
	return nodes;
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	return [
		h('node-icon', { class: node.class === 'folder' ? 'icon-folder' : 'icon-string' })
	];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	Localization?.listSelect?.(event);
};
const onListRecord = (event: Event & { value?: unknown }) => {
	Localization?.listRecord?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	Localization?.listOpen?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	Localization?.listPopup?.(event);
};

const onApply = () => {
	Localization?.apply?.();
};

onMounted(() => {


});
</script>
