<template>
	<WindowFrame
		id="presetObject"
		:ref="registryRef(composableEls, 'presetObject')"
		mode="center"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.presetObject.title') }}
				<div class="close"></div></TitleBar
		></template>

		<CustomBox
			id="presetObject-sceneId"
			:ref="registryRef(composableEls, 'presetObject-sceneId')"
			type="file"
			filter="scene"
			@write="onSceneIdWrite"
		/>
		<TreeList
			id="presetObject-list"
			:ref="registryRef(composableEls, 'presetObject-list')"
			:node-icon-renderer="nodeIconRenderer"
			@open="onListOpen"
		/>
		<TextBox
			id="presetObject-searcher"
			:ref="registryRef(composableEls, 'presetObject-searcher')"
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
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import { encodeURL } from '@app/utils/css';

const { t } = useI18n();

interface PresetIconNode {
	class?: string;
	teamId?: string;
	color?: string;
	red?: number;
	green?: number;
	blue?: number;
	image?: string;
}

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as PresetIconNode;
	switch (node.class) {
		case 'folder':
			return [h('span', { class: ['node-icon', 'icon-folder'] })];
		case 'actor': {
			const team = Data.teams?.map?.[node.teamId ?? ''];
			const hex = team ? team.color : 'ffffffff';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [
				h(
					'span',
					{ class: 'node-icon', style: { color: `rgba(${r}, ${g}, ${b}, ${a})` } },
					'\uf2c0'
				)
			];
		}
		case 'region': {
			const hex = node.color ?? '';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [
				h('span', {
					class: ['node-icon', 'icon-scene-region'],
					style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }
				})
			];
		}
		case 'light':
			return [
				h(
					'span',
					{
						class: 'node-icon',
						style: { color: `rgba(${node.red}, ${node.green}, ${node.blue})` }
					},
					'\uf006'
				)
			];
		case 'animation':
			return [h('span', { class: 'node-icon' }, '\uf110')];
		case 'particle':
			return [h('span', { class: 'node-icon' }, '\uf2dc')];
		case 'parallax': {
			const path = File.getPath?.(node.image);
			if (path) {
				return [
					h('span', {
						class: ['node-icon', 'icon-scene-parallax'],
						style: { backgroundImage: encodeURL(File.route!(path)) }
					})
				];
			}
			return [h('span', { class: 'node-icon' }, '\uf1c5')];
		}
		case 'tilemap':
			return [h('span', { class: 'node-icon' }, '\uf00a')];
		default:
			return [h('span', { class: ['node-icon', 'icon-file'] })];
	}
};

const onSceneIdWrite = (value: unknown) => {
	PresetObject?.sceneIdWrite?.({ value } as Event & { value?: string });
};
const onListOpen = (event: Event & { value?: unknown }) => {
	PresetObject?.listOpen?.(event);
};
const onSearcherInput = (value: string | Event) => {
	const text =
		typeof value === 'string'
			? value
			: ((value.target as HTMLInputElement | null)?.value ?? '');
	PresetObject?.searcherInput?.({ value: text });
};
const onConfirm = () => {
	PresetObject?.confirm?.();
};

onMounted(() => {});
</script>

<style>
/* 窗口样式迁移：由 Project/css/ui.css 迁入组件（选择器为全局 id，不能用 scoped） */
#presetObject {
	width: 340px;
	height: 528px;
}

#presetObject-sceneId {
	position: absolute;
	left: 10px;
	top: 10px;
	width: 320px;
}

#presetObject-list {
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

#presetObject-searcher {
	position: absolute;
	left: 10px;
	top: 440px;
	width: 320px;
}

#presetObject-confirm {
	right: 108px;
	bottom: 10px;
}

#presetObject-cancel {
	right: 10px;
	bottom: 10px;
}
</style>
