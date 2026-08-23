<template>
		<WindowFrame id="presetElement" mode="center" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.presetElement.title') }}<div class="close"></div></TitleBar></template>
		
			<CustomBox
				id="presetElement-uiId"
				type="file"
				filter="ui"
				@write="onUiIdWrite"
			/>
			<TreeList id="presetElement-list" :node-icon-renderer="nodeIconRenderer" @open="onListOpen" />
			<TextBox id="presetElement-searcher" name="search" @input="onSearcherInput" @compositionend="onSearcherInput" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { PresetElement } from '@app/composables/usePresetElementWindow';
import { Data } from '@app/data/data-object.ts';
import { UI } from '@app/ui/ui-window.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();

interface PresetIconNode {
	class?: string;
	prefabId?: string;
	presetId?: string;
}

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as PresetIconNode;
	if (node.class === 'folder') {
		return [h('span', { class: ['node-icon', 'icon-folder'] })];
	}
	const classes = {
		image: 'icon-ui-image',
		text: 'icon-ui-text',
		textbox: 'icon-ui-textbox',
		dialogbox: 'icon-ui-dialogbox',
		progressbar: 'icon-ui-progressbar',
		button: 'icon-ui-button',
		animation: 'icon-ui-animation',
		video: 'icon-ui-video',
		window: 'icon-ui-window',
		container: 'icon-ui-container',
		reference: 'icon-ui-reference'
	} as Record<string, string>;
	let iconClass: string;
	if (node.class === 'reference') {
		const preset = Data.uiPresets?.[node.prefabId ?? ''];
		const presetClass = classes[preset?.data?.class ?? ''];
		iconClass =
			presetClass && presetClass !== 'icon-ui-reference'
				? presetClass
				: 'icon-ui-reference';
	} else {
		iconClass = classes[node.class ?? ''] ?? 'icon-ui-reference';
	}
	const iconClasses = [iconClass];
	if (node.class === 'reference' && iconClass !== 'icon-ui-reference') {
		iconClasses.push('icon-ui-reference-active');
	}
	if (UI.hasPrefab?.(node)) {
		iconClasses.push('icon-ui-set-as-prefab');
	}
	return [h('span', { class: ['node-icon', iconClasses ]})];
};

const onUiIdWrite = (value: unknown) => {
	PresetElement?.uiIdWrite?.({ value });
};
const onListOpen = (event: Event & { value?: unknown }) => {
	PresetElement?.listOpen?.(event);
};
const onSearcherInput = (value: string | Event) => {
	const text =
		typeof value === 'string'
			? value
			: ((value.target as HTMLInputElement | null)?.value ?? '');
	PresetElement?.searcherInput?.({ value: text });
};
const onConfirm = () => {
	PresetElement?.confirm?.();
};

const local = useLocalStore();

onMounted(() => {
});
</script>
