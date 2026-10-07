<template>
	<div
		class="page-frame"
		id="scene-object"
		:ref="registryRef(sceneEls, 'scene-object')"
		value="scene-object"
	>
		<div class="box" id="scene-list-head" :ref="registryRef(sceneEls, 'scene-list-head')">
			<TextBox
				id="scene-searcher"
				:ref="registryRef(sceneEls, 'scene-searcher')"
				name="search"
			></TextBox>
		</div>
		<TreeList
			id="scene-list"
			:ref="registryRef(sceneEls, 'scene-list')"
			padded
			:node-extras="sceneNodeExtras"
			:node-icon-renderer="sceneNodeIcon"
			@select="onSceneListSelect"
			@record="onSceneListRecord"
			@popup="onSceneListPopup"
			@open="onSceneListOpen"
			@change="onSceneListChange"
		></TreeList>
	</div>
</template>

<script setup lang="ts">
import { h, type VNode } from 'vue';
import { sceneEls } from '@app/scene/element-registry';
import { registryRef } from '@app/utils/element-registry';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import { getLazyWindow } from '@app/tools/window-registry';
import { getSceneStore } from '@app/stores/scene';
import { Data } from '@app/data/data-object.ts';
import { File } from '@app/file/file-system-core.ts';
import { encodeURL } from '@app/utils/css';

const loadCluster = () => import('@app/tools/window-cluster');
const Scene = getLazyWindow('scene', () => loadCluster().then((m) => m.Scene));

interface SceneExtrasNode {
	class?: string;
	enabled?: boolean;
	conditions?: unknown[];
	events?: unknown[];
	scripts?: unknown[];
	hidden?: boolean;
	locked?: boolean;
	parent?: SceneExtrasNode;
	teamId?: string;
	color?: string;
	red?: number;
	green?: number;
	blue?: number;
	image?: string;
}

type ExtrasListElement = HTMLElement & {
	canSwitchState: (item: unknown) => boolean;
	setRecursiveStates: (item: unknown, key: string, value: boolean | undefined) => unknown[];
	updateFolderState: (item: unknown, key: string) => void;
	update: () => void;
};

const onSceneVisibilityPointerdown =
	(item: SceneExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list || !list.canSwitchState(item)) return;
		const { hidden } = item;
		const backups = list.setRecursiveStates(item, 'hidden', !hidden);
		list.updateFolderState(item.parent, 'hidden');
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Scene.requestRendering?.();
		Scene.history.save({
			type: 'scene-object-hidden',
			item: item,
			oldValues: backups,
			newValue: !hidden
		});
	};

const onSceneLockPointerdown =
	(item: SceneExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list || !list.canSwitchState(item)) return;
		const { locked } = item;
		const backups = list.setRecursiveStates(item, 'locked', !locked);
		list.updateFolderState(item.parent, 'hidden');
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Scene.history.save({
			type: 'scene-object-locked',
			item: item,
			oldValues: backups,
			newValue: !locked
		});
	};

const sceneNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as SceneExtrasNode;
	const element = container.parentNode as HTMLElement | null;
	const nodes: VNode[] = [];
	if (node.class !== 'folder') {
		element?.classList.add('reference');
	} else {
		element?.classList.remove('reference');
	}
	if (node === getSceneStore().tilemap) {
		element?.classList.add('highlight');
	}
	if (node.conditions instanceof Array) {
		const condition = node.enabled
			? node.conditions.length !== 0
				? 'conditional'
				: 'none'
			: 'absent';
		if (condition === 'none') {
			element?.classList.remove('weak');
		} else {
			if (condition === 'conditional') {
				element?.classList.remove('weak');
			} else {
				element?.classList.add('weak');
			}
			nodes.push(
				h(
					'span',
					{ class: ['node-icon', 'icon-conditional'] },
					condition === 'conditional' ? '?' : '!'
				)
			);
		}
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
				onPointerdown: onSceneVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		)
	);
	nodes.push(
		h(
			'span',
			{
				class: ['lock-icon', { 'node-icon-highlight': !!node.locked }],
				onPointerdown: onSceneLockPointerdown(node, container)
			},
			node.locked ? '\uf023' : '\uf09c'
		)
	);
	return nodes;
};

const sceneNodeIcon = (item: unknown): VNode[] => {
	const node = item as SceneExtrasNode;
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

const onSceneListSelect = (event: Event & { value?: unknown }) => {
	Scene?.listSelect?.(event);
};
const onSceneListRecord = (event: Event & { value?: unknown }) => {
	Scene?.listRecord?.(event);
};
const onSceneListPopup = (event: Event & { value?: unknown }) => {
	Scene?.listPopup?.(event);
};
const onSceneListOpen = (event: Event & { value?: unknown }) => {
	Scene?.listOpen?.(event);
};
const onSceneListChange = (event: Event) => {
	Scene?.listChange?.(event);
};
</script>
