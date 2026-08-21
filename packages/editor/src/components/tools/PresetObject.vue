<template>
		<WindowFrame id="presetObject" mode="center" @confirm="onConfirm">
		<template #title><TitleBar>{{ t('components.presetObject.title') }}<div class="close"></div></TitleBar></template>
		
			<CustomBox
				id="presetObject-sceneId"
				type="file"
				filter="scene"
				@write="onSceneIdWrite"
			/>
			<TreeList id="presetObject-list" :node-icon-renderer="nodeIconRenderer" @open="onListOpen" />
			<TextBox id="presetObject-searcher" name="search" @input="onSearcherInput" @compositionend="onSearcherInput" />
		
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { PresetObject } from '@app/composables/usePresetObjectWindow';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import CustomBox from '@app/components/common/CustomBox.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

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
			return [h('node-icon', { class: 'icon-folder' })];
		case 'actor': {
			const team = Data.teams?.map?.[node.teamId ?? ''];
			const hex = team ? team.color : 'ffffffff';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [h('node-icon', { style: { color: `rgba(${r}, ${g}, ${b}, ${a})` } }, '\uf2c0')];
		}
		case 'region': {
			const hex = node.color ?? '';
			const r = parseInt(hex.slice(0, 2), 16);
			const g = parseInt(hex.slice(2, 4), 16);
			const b = parseInt(hex.slice(4, 6), 16);
			const a = parseInt(hex.slice(6, 8), 16) / 255;
			return [
				h('node-icon', {
					class: 'icon-scene-region',
					style: { backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})` }
				})
			];
		}
		case 'light':
			return [
				h(
					'node-icon',
					{ style: { color: `rgba(${node.red}, ${node.green}, ${node.blue})` } },
					'\uf006'
				)
			];
		case 'animation':
			return [h('node-icon', {}, '\uf110')];
		case 'particle':
			return [h('node-icon', {}, '\uf2dc')];
		case 'parallax': {
			const path = File.getPath?.(node.image);
			if (path) {
				return [
					h('node-icon', {
						class: 'icon-scene-parallax',
						style: { backgroundImage: CSS.encodeURL(File.route!(path)) }
					})
				];
			}
			return [h('node-icon', {}, '\uf1c5')];
		}
		case 'tilemap':
			return [h('node-icon', {}, '\uf00a')];
		default:
			return [h('node-icon', { class: 'icon-file' })];
	}
};

const onSceneIdWrite = (value: unknown) => {
	PresetObject?.sceneIdWrite?.({ value });
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

onMounted(() => {
});
</script>
