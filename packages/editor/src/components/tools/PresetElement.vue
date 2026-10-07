<template>
	<WindowFrame
		id="presetElement"
		:ref="registryRef(composableEls, 'presetElement')"
		mode="center"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.presetElement.title') }}
				<div class="close"></div></TitleBar
		></template>

		<CustomBox
			id="presetElement-uiId"
			:ref="registryRef(composableEls, 'presetElement-uiId')"
			type="file"
			filter="ui"
			@write="onUiIdWrite"
		/>
		<TreeList
			id="presetElement-list"
			:ref="registryRef(composableEls, 'presetElement-list')"
			:node-icon-renderer="nodeIconRenderer"
			@open="onListOpen"
		/>
		<TextBox
			id="presetElement-searcher"
			:ref="registryRef(composableEls, 'presetElement-searcher')"
			name="search"
			@input="onSearcherInput"
			@compositionend="onSearcherInput"
		/>
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { composableEls } from '@app/composables/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { useI18n } from 'vue-i18n';
import { PresetElement } from '@app/composables/usePresetElementWindow';
import { Data } from '@app/data/data-object.ts';
import { getUIStore } from '@app/stores/ui';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

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
			presetClass && presetClass !== 'icon-ui-reference' ? presetClass : 'icon-ui-reference';
	} else {
		iconClass = classes[node.class ?? ''] ?? 'icon-ui-reference';
	}
	const iconClasses = [iconClass];
	if (node.class === 'reference' && iconClass !== 'icon-ui-reference') {
		iconClasses.push('icon-ui-reference-active');
	}
	if (getUIStore().hasPrefab(node)) {
		iconClasses.push('icon-ui-set-as-prefab');
	}
	return [h('span', { class: ['node-icon', iconClasses] })];
};

const onUiIdWrite = (value: unknown) => {
	PresetElement?.uiIdWrite?.({ value } as Event & { value?: string });
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

onMounted(() => {});
</script>

<style>
#presetElement {
	width: 340px;
	height: 528px;
}

#presetElement-uiId {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 320px;
}

#presetElement-list {
	position: absolute;
	left: 10px;
	top: 34px;
	width: 320px;
	height: 402px;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
}

#presetElement-searcher {
	position: absolute;
	left: 10px;
	top: 440px;
	width: 320px;
}

#presetElement-confirm {
	right: 108px;
	bottom: 10px;
}

#presetElement-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
