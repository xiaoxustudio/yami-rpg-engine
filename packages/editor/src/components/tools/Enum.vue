<template>
	<WindowFrame id="enum" show-apply mode="center" @apply="onApply">
		<template #title><TitleBar>{{ t('components.enum.title') }}<div class="close" /></TitleBar></template>
		
			<div class="field-set input pad" id="enum-list-fieldset">
				<div class="legend">{{ t('components.enum-list.label') }}</div>
				<TreeList
					id="enum-list"
					padded
					:node-extras="nodeExtras"
					:node-icon-renderer="nodeIconRenderer"
					@select="onListSelect"
					@record="onListRecord"
					@open="onListOpen"
					@popup="onListPopup"
				/>
			</div>
			<div class="field-set" id="enum-properties-fieldset">
				<div class="legend">{{ t('components.enum-properties-flex.label') }}</div>
				<div class="flex-box" id="enum-properties-flex">
					<div class="flex-item"
						><div class="text">{{ t('components.enum-name.label') }}</div><TextBox id="enum-name" menu="tag-localization" @input="onNameInput" /></div>
					<div class="flex-item"
						><div class="text">{{ t('components.enum-value.label') }}</div><TextBox id="enum-value" menu="tag-localization" @input="onValueInput" /></div>
					<div class="flex-item" id="enum-spacing-box" />
					<div class="flex-item"><div class="text">{{ t('components.enum-note.label') }}</div><TextArea id="enum-note" /></div>
				</div>
			</div>
			<TextBox id="enum-searcher" name="search" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { Enum } from '@app/enum/enum-window.ts';
import { GameLocal } from '@app/local/local-object.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import { getEnumStore } from '@app/stores/enum';
import TextArea from '@app/components/common/TextArea.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const nodeExtras = (item: unknown): VNode[] => {
	const node = item as { class?: string; id: string; value?: string; note?: string };
	const nodes: VNode[] = [];
	if (node.class === 'folder') {
		const store = getEnumStore();
		let group = '';
		for (const key of store.state.settingKeys ?? []) {
			if (node.id === store.state.settings?.[key]) {
				group = key;
			}
		}
		if (group) {
			nodes.push(h('div', { class: 'enum-init-text text' }, ' ★'));
		}
	} else {
		const value = node.value as string;
		nodes.push(
			h('div', { class: 'enum-init-text text' }, value ? ` = ${GameLocal.replace(value)}` : '')
		);
		if (node.note) {
			nodes.push(h('span', { class: ['node-icon', 'icon-note'], },  '\uf27b'));
		}
	}
	return nodes;
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	return [
		h('span', { class: ['node-icon', node.class === 'folder' ? 'icon-folder' : 'icon-string'] })
	];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	Enum?.listSelect?.(event);
};
const onListRecord = (event: Event & { value?: unknown }) => {
	Enum?.listRecord?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	Enum?.listOpen?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	Enum?.listPopup?.(event);
};
const onNameInput = (value: string) => {
	Enum?.nameInput?.({ target: { value } });
};
const onValueInput = (value: string) => {
	Enum?.valueInput?.({ target: { value } });
};

const onApply = () => {
	Enum?.apply?.();
};

onMounted(() => {


});
</script>
