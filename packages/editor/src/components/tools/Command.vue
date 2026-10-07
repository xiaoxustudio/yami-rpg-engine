<template>
	<WindowFrame
		id="command"
		:ref="registryRef(customCommandEls, 'command')"
		show-apply
		@apply="onApply"
		@confirm="onConfirm"
	>
		<template #title
			><TitleBar
				>{{ t('components.command.title') }}
				<div class="close" /></TitleBar
		></template>

		<div class="field-set input pad" id="command-list-fieldset">
			<div class="legend">{{ t('components.command-list.label') }}</div>
			<TreeList
				id="command-list"
				:ref="registryRef(customCommandEls, 'command-list')"
				padded
				:node-extras="nodeExtras"
				:node-icon-renderer="nodeIconRenderer"
				@select="onListSelect"
				@popup="onListPopup"
				@open="onListOpen"
				@change="onListChange"
			/>
		</div>
		<div class="box" id="command-inspector">
			<DetailBox
				id="command-overview-detail"
				:ref="registryRef(customCommandEls, 'command-overview-detail')"
				open
			>
				<DetailSummary>{{ t('components.command-overview.label') }}</DetailSummary>
				<div
					class="box"
					id="command-overview"
					:ref="registryRef(customCommandEls, 'command-overview')"
					@update="syncOverview"
				>
					<PluginOverview :meta="overviewMeta" detailed />
				</div>
			</DetailBox>
			<DetailBox
				id="command-settings-detail"
				:ref="registryRef(customCommandEls, 'command-settings-detail')"
				open
			>
				<DetailSummary>{{ t('components.command-settings-grid.label') }}</DetailSummary>
				<div class="detail-grid" id="command-settings-grid">
					<div class="text">{{ t('components.command-alias.label') }}</div>
					<TextBox
						:label="t('components.command-alias.label')"
						id="command-alias"
						:placeholder="t('components.command-alias.placeholder')"
						v-tip="t('components.command-alias.tip')"
						v-model="commandForm.alias"
						@input="onParamInput"
					/>
					<div class="text">{{ t('components.command-keywords.label') }}</div>
					<TextBox
						:label="t('components.command-keywords.label')"
						id="command-keywords"
						:placeholder="t('components.command-keywords.placeholder')"
						v-tip="t('components.command-keywords.tip')"
						v-model="commandForm.keywords"
						@input="onParamInput"
					/>
				</div>
			</DetailBox>
		</div>
	</WindowFrame>
</template>

<script setup lang="ts">
import { h, onMounted, ref, type VNode } from 'vue';
import type { YamiEvent } from '@app/types/editor-event';
import { useI18n } from 'vue-i18n';
import { File } from '@app/file/file-system-core.ts';
import { getBrowserStore } from '@app/stores/browser';
import {
	CustomCommand,
	commandForm,
	customCommandEls
} from '@app/commands/custom-command-window.ts';
import { registryRef } from '@app/utils/element-registry';
import type { PluginMetaShape } from '@app/plugin/plugin.ts';
import PluginOverview from '@app/components/tools/PluginOverview.vue';
import WindowFrame from '@app/components/common/WindowFrame.vue';
import TitleBar from '@app/components/common/TitleBar.vue';
import DetailBox from '@app/components/common/DetailBox.vue';
import DetailSummary from '@app/components/common/DetailSummary.vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';

const { t } = useI18n();

const overviewMeta = ref<PluginMetaShape | null>(null);

const syncOverview = (): void => {
	overviewMeta.value = (CustomCommand?.meta ?? null) as PluginMetaShape | null;
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

const onListSelect = (event: YamiEvent) => {
	CustomCommand?.listSelect?.(event as never);
};
const onListPopup = (event: Event & { value?: unknown }) => {
	(
		CustomCommand?.listPopup as
			| ((event: PointerEvent & { value?: unknown }) => void)
			| null
			| undefined
	)?.(event as PointerEvent & { value?: unknown });
};
const onListOpen = (event: Event & { value?: unknown }) => {
	(
		CustomCommand?.listOpen as ((event: Event & { value?: unknown }) => void) | null | undefined
	)?.(event);
};
const onListChange = (_event: Event & { value?: unknown }) => {
	CustomCommand?.listChange?.();
};
const onParamInput = (_value: string) => {
	const target: EventTarget | null = document.activeElement;
	CustomCommand?.paramInput?.({ target } as Event);
};

const onApply = () => {
	(CustomCommand?.apply as ((event?: Event) => void) | null)?.();
};

const onConfirm = () => {
	CustomCommand?.confirm?.(new Event('click'));
};

onMounted(() => {});
</script>

<style>
#command-suggestions {
	display: block;
	position: fixed;
	margin-left: var(--1dpx);
	width: calc(400px - var(--2dpx));

	background-color: var(--suggestion-widget-background);
	outline: var(--window-outline);
	pointer-events: visible;
}

#command-searcher {
	position: absolute;
	top: 0;
	width: 100%;
	font-family: var(--font-family-mono);
	border-radius: 0;
}

#command-searcher-mark {
	position: absolute;
	left: 0;
	line-height: 18px;
	text-indent: 4px;
	color: var(--text-color-unit);
}

#command-searcher-input {
	padding-left: 12px;
}

#command {
	width: 700px;
	height: 700px;
}

#command-list-fieldset {
	left: 10px;
	top: 10px;
	width: 270px;
	height: 622px;
}

#command-inspector {
	position: absolute;
	left: 290px;
	top: 10px;
	width: 400px;
	height: 622px;
	background-color: var(--fieldset-background);
	overflow-x: hidden;
	overflow-y: auto;
}

#command-overview {
	display: block;
	margin: 4px;
	padding: 4px 10px;
	width: calc(100% - 8px);

	user-select: text;
	overflow: hidden;
	white-space: pre-wrap;
	text-overflow: ellipsis;
	background-color: var(--input-background);
	border-top: var(--input-border-dark);
	border-left: var(--input-border-light);
	border-right: var(--input-border-light);
	border-bottom: var(--input-border-light);
	border-radius: 2px;
}

#command-confirm {
	right: 206px;
	bottom: 10px;
}

#command-cancel {
	right: 108px;
	bottom: 10px;
}

#command-apply {
	right: 10px;
	bottom: 10px;
}
</style>
