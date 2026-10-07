<template>
	<div
		class="page-frame"
		id="ui-element"
		:ref="registryRef(uiEls, 'ui-element')"
		value="ui-element"
	>
		<div class="box" id="ui-list-head" :ref="registryRef(uiEls, 'ui-list-head')">
			<TextBox
				id="ui-searcher"
				:ref="registryRef(uiEls, 'ui-searcher')"
				name="search"
			></TextBox>
		</div>
		<TreeList
			id="ui-list"
			:ref="registryRef(uiEls, 'ui-list')"
			padded
			:node-extras="uiNodeExtras"
			:node-icon-renderer="uiNodeIcon"
			@select="onUiListSelect"
			@record="onUiListRecord"
			@popup="onUiListPopup"
			@open="onUiListOpen"
			@change="onUiListChange"
		></TreeList>
	</div>
</template>

<script setup lang="ts">
import { h, type VNode } from 'vue';
import { uiEls } from '@app/engine/ui/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { UIEngine } from '@app/engine/ui/ui-engine.ts';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import { getLazyWindow } from '@app/tools/window-registry';
import { Data } from '@app/data/data-object.ts';

const UI = getLazyWindow('ui', () => import('@app/engine/ui/ui-singleton.ts').then((m) => m.UI));

interface UiExtrasNode {
	class?: string;
	enabled?: boolean;
	hidden?: boolean;
	locked?: boolean;
	instance?: UiExtrasNode;
	events?: unknown[];
	scripts?: unknown[];
	conditions?: unknown[];
	prefabId?: string;
	presetId?: string;
}

type ExtrasListElement = HTMLElement & {
	canSwitchState: (item: unknown) => boolean;
	setRecursiveStates: (item: unknown, key: string, value: boolean | undefined) => unknown[];
	updateFolderState: (item: unknown, key: string) => void;
	update: () => void;
};

const onUiVisibilityPointerdown =
	(item: UiExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { instance, hidden } = item;
		const backups1 = list.setRecursiveStates(item, 'hidden', !hidden);
		const backups2 = list.setRecursiveStates(instance, 'visible', hidden);
		const length = Math.max(backups1.length, backups2.length);
		for (let i = 0; i < length; i++) {
			if (backups1[i] === backups2[i]) {
				throw new Error('Failed to switch hidden state');
			}
		}
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		UIEngine.requestRendering!.call(UI);
		UI.history!.save({
			type: 'ui-object-hidden',
			item: item,
			oldValues1: backups1,
			oldValues2: backups2,
			newValue: !hidden
		});
	};

const onUiLockPointerdown =
	(item: UiExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { locked } = item;
		const backups = list.setRecursiveStates(item, 'locked', !locked);
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		UI.history!.save({
			type: 'ui-object-locked',
			item: item,
			oldValues: backups,
			newValue: !locked
		});
	};

const uiNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as UiExtrasNode;
	const element = container.parentNode as HTMLElement | null;
	const nodes: VNode[] = [];
	if (node.class !== 'folder') {
		element?.classList.add('reference');
	} else {
		element?.classList.remove('reference');
	}
	if (node.enabled) {
		element?.classList.remove('weak');
	} else {
		element?.classList.add('weak');
		nodes.push(h('span', { class: ['node-icon', 'icon-conditional'] }, '!'));
	}
	if (node.events instanceof Array && node.events.length !== 0) {
		nodes.push(h('span', { class: ['node-icon', 'icon-eventEnabled'] }, 'E'));
	}
	if (node.scripts instanceof Array && node.scripts.length !== 0) {
		nodes.push(h('span', { class: ['node-icon', 'icon-scriptEnabled'] }, '\uf121'));
	}
	nodes.push(
		h(
			'span',
			{
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onUiVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		)
	);
	nodes.push(
		h(
			'span',
			{
				class: ['lock-icon', { 'node-icon-highlight': !!node.locked }],
				onPointerdown: onUiLockPointerdown(node, container)
			},
			node.locked ? '\uf023' : '\uf09c'
		)
	);
	return nodes;
};

const uiNodeIcon = (item: unknown): VNode[] => {
	const node = item as UiExtrasNode;
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
	if (UI.hasPrefab?.(node)) {
		iconClasses.push('icon-ui-set-as-prefab');
	}
	return [h('span', { class: ['node-icon', iconClasses] })];
};

const onUiListSelect = (event: Event) => {
	UI?.listSelect?.(event);
};
const onUiListRecord = (event: Event) => {
	UI?.listRecord?.(event);
};
const onUiListPopup = (event: Event) => {
	UI?.listPopup?.(event);
};
const onUiListOpen = (event: Event) => {
	UI?.listOpen?.(event);
};
const onUiListChange = (event: Event) => {
	UI?.listChange?.(event);
};
</script>
