<template>
	<WindowFrame id="plugin" show-apply @apply="onApply">
		<template #title
			><TitleBar
				>{{ t('components.plugin.title') }}
				<div class="close"></div></TitleBar
		></template>

		<div class="field-set input pad" id="plugin-list-fieldset">
			<div class="legend">{{ t('components.plugin-list.label') }}</div>
			<TreeList
				id="plugin-list"
				padded
				:node-extras="nodeExtras"
				:node-icon-renderer="nodeIconRenderer"
				@select="onListSelect"
				@popup="onListPopup"
				@open="onListOpen"
				@change="onListChange"
			/>
		</div>
		<div class="box" id="plugin-inspector">
			<DetailBox id="plugin-overview-detail" open>
				<DetailSummary>Overview</DetailSummary>
				<div class="box" id="plugin-overview" @update="syncOverview">
					<PluginOverview :meta="overviewMeta" :detailed="overviewDetailed" />
				</div>
			</DetailBox>
			<ParameterPane id="plugin-parameter-pane">
				<DetailBox id="plugin-parameter-detail" open>
					<DetailSummary>Parameters</DetailSummary>
					<div class="detail-grid" id="plugin-parameter-grid" />
				</DetailBox>
			</ParameterPane>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, ref, shallowRef, type VNode } from 'vue';
import { useI18n } from 'vue-i18n';
import { File } from '@app/file/file-system-core.ts';
import { getBrowserStore } from '@app/stores/browser';
import { PluginManager } from '@app/plugin/plugin.ts';
import type { PluginMetaShape } from '@app/plugin/plugin.ts';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import { useInspectorStore } from '@app/stores/inspector';
import { useLocalStore } from '@app/stores/local';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import ParameterPane from '@app/components/common/ParameterPane.vue';
import TreeList from '@app/components/common/TreeList.vue';
import PluginOverview from '@app/components/tools/PluginOverview.vue';

const { t } = useI18n();

const inspector = useInspectorStore();
const local = useLocalStore();

const overviewMeta = shallowRef<PluginMetaShape | null>(PluginManager.meta);
const overviewDetailed = ref(PluginManager.detailed);

const syncOverview = () => {
	overviewMeta.value = PluginManager.meta;
	overviewDetailed.value = PluginManager.detailed;
};

const nodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { enabled?: boolean; id?: string };
	const element = container.parentNode as HTMLElement | null;
	element?.classList.add('plugin-item');
	if (node.enabled) {
		element?.classList.remove('weak');
	} else {
		element?.classList.add('weak');
	}
	return [
		h(
			'div',
			{
				class: 'box script-edit-button plugin-item-button',
				onPointerdown: (event: PointerEvent) => {
					if (event.button !== 0 || !node.id) return;
					const path = File.getPath?.(node.id) || node.id;
					if (path) getBrowserStore().openScript?.(path);
				}
			},
			'\uf044'
		)
	];
};

const nodeIconRenderer = (item: unknown): VNode[] => {
	const node = item as { class?: string };
	if (node.class === 'folder') {
		return [h('span', { class: ['node-icon', 'icon-folder'] })];
	}
	return [h('span', { class: ['node-icon', ['icon-command', 'custom']] })];
};

const onListSelect = (event: Event & { value?: unknown }) => {
	PluginManager?.listSelect?.(event);
};
const onListPopup = (event: PointerEvent & { value?: unknown }) => {
	PluginManager?.listPopup?.(event);
};
const onListChange = (event: Event & { value?: unknown }) => {
	PluginManager?.listChange?.(event);
};
const onListOpen = (event: Event & { value?: unknown }) => {
	PluginManager?.listOpen?.(event);
};

const onApply = () => {
	PluginManager?.apply?.();
};

onMounted(() => {});
</script>
