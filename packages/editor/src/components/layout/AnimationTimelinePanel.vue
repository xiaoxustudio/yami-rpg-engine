<template>
	<div
		class="page-frame"
		id="animation-timeline"
		:ref="registryRef(animationEls, 'animation-timeline')"
		value="animation-timeline"
	>
		<div
			class="box"
			id="animation-timeline-head"
			:ref="registryRef(animationEls, 'animation-timeline-head')"
		>
			<div
				class="box"
				id="animation-timeline-toolbar"
				:ref="registryRef(animationEls, 'animation-timeline-toolbar')"
				@pointerdown="onTimelineToolbarPointerdown"
			>
				<div
					class="item toolbar-item"
					id="animation-timeline-previousKey"
					v-tip="t('components.animation-timeline-previousKey.tip')"
					value="previousKey"
					hotkey="Z"
				>
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<rect x="1.5" y="2" width="2" height="12" />
						<path d="M14.5 2 L4.5 8 L14.5 14 Z" />
					</svg>
				</div>
				<div
					class="item toolbar-item"
					id="animation-timeline-previous"
					v-tip="t('components.animation-timeline-previous.tip')"
					value="previous"
					hotkey="Q"
				>
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path d="M8 2 L1 8 L8 14 Z M15 2 L8 8 L15 14 Z" />
					</svg>
				</div>
				<div
					class="item toolbar-item"
					id="animation-timeline-play"
					v-tip="t('components.animation-timeline-play.tip')"
					value="play"
					hotkey="R"
					:class="{ playing: animation.playing }"
				>
					<svg v-if="animation.playing" viewBox="0 0 16 16" aria-hidden="true">
						<rect x="3" y="2" width="3.5" height="12" />
						<rect x="9.5" y="2" width="3.5" height="12" />
					</svg>
					<svg v-else viewBox="0 0 16 16" aria-hidden="true">
						<path d="M3.5 1.5 L14.5 8 L3.5 14.5 Z" />
					</svg>
				</div>
				<div
					class="item toolbar-item"
					id="animation-timeline-next"
					v-tip="t('components.animation-timeline-next.tip')"
					value="next"
					hotkey="E"
				>
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path d="M1 2 L8 8 L1 14 Z M8 2 L15 8 L8 14 Z" />
					</svg>
				</div>
				<div
					class="item toolbar-item"
					id="animation-timeline-nextKey"
					v-tip="t('components.animation-timeline-nextKey.tip')"
					value="nextKey"
					hotkey="X"
				>
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path d="M1 2 L11.5 8 L1 14 Z" />
						<rect x="12.5" y="2" width="2" height="12" />
					</svg>
				</div>
				<div
					class="item toolbar-item"
					id="animation-timeline-loop"
					v-tip="t('components.animation-timeline-loop.tip')"
					value="loop"
					:class="{ selected: animation.loop }"
				>
					<svg viewBox="0 0 16 16" aria-hidden="true">
						<path
							d="M2.5 8 A5.5 5.5 0 0 1 8 2.5 H11 M13.5 8 A5.5 5.5 0 0 1 8 13.5 H5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						/>
						<path d="M9 0.5 L12.5 2.5 L9 4.5 Z" />
						<path d="M7 11.5 L3.5 13.5 L7 15.5 Z" />
					</svg>
				</div>
			</div>
			<div
				class="box"
				id="animation-timeline-ruler-outer"
				:ref="registryRef(animationEls, 'animation-timeline-ruler-outer')"
			>
				<div
					class="box"
					id="animation-timeline-ruler-inner"
					:ref="registryRef(animationEls, 'animation-timeline-ruler-inner')"
				></div>
			</div>
		</div>
		<TreeList
			id="animation-layer-list"
			:ref="registryRef(animationEls, 'animation-layer-list')"
			:node-extras="layerNodeExtras"
			:node-icon-renderer="layerNodeIcon"
			@select="onLayerListSelect"
			@record="onLayerListRecord"
			@popup="onLayerListPopup"
			@change="onLayerListChange"
		></TreeList>
		<div
			class="box"
			id="animation-timeline-list-outer"
			:ref="registryRef(animationEls, 'animation-timeline-list-outer')"
			tabindex="0"
		>
			<div
				class="box"
				id="animation-timeline-list-inner"
				:ref="registryRef(animationEls, 'animation-timeline-list-inner')"
			></div>
			<div
				class="box"
				id="animation-timeline-cursor"
				:ref="registryRef(animationEls, 'animation-timeline-cursor')"
			></div>
			<div
				class="box"
				id="animation-timeline-marquee"
				:ref="registryRef(animationEls, 'animation-timeline-marquee')"
			></div>
			<div
				class="box"
				id="animation-timeline-marquee-shift"
				:ref="registryRef(animationEls, 'animation-timeline-marquee-shift')"
			></div>
		</div>
		<div
			class="box"
			id="animation-timeline-pointer-area-outer"
			:ref="registryRef(animationEls, 'animation-timeline-pointer-area-outer')"
		>
			<div
				class="box"
				id="animation-timeline-pointer-area-inner"
				:ref="registryRef(animationEls, 'animation-timeline-pointer-area-inner')"
			>
				<div
					class="box"
					id="animation-timeline-pointer"
					:ref="registryRef(animationEls, 'animation-timeline-pointer')"
				></div>
			</div>
		</div>
		<!-- 播放栏在 `#animation-timeline-head` 里（紧跟页签之后、刻度尺之前）：
		     head 带 `z-index` 压在分组页签带之上，所以两者都看得见。 -->
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { h, type VNode } from 'vue';
import { animationEls } from '@app/animation/element-registry';
import { registryRef } from '@app/utils/element-registry';
import TreeList from '@app/components/common/TreeList.vue';
import { getLazyWindow } from '@app/tools/window-registry';
import { getAnimationStore } from '@app/stores/animation';

const { t } = useI18n();

const loadCluster = () => import('@app/tools/window-cluster');
const Animation = getLazyWindow('animation', () => loadCluster().then((m) => m.Animation));

const animation = getAnimationStore();

interface LayerExtrasNode {
	hidden?: boolean;
	locked?: boolean;
}

type ExtrasListElement = HTMLElement & {
	canSwitchState: (item: unknown) => boolean;
	setRecursiveStates: (item: unknown, key: string, value: boolean | undefined) => unknown[];
	updateFolderState: (item: unknown, key: string) => void;
	update: () => void;
};

const onLayerVisibilityPointerdown =
	(item: LayerExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { hidden } = item;
		const backups = list.setRecursiveStates(item, 'hidden', !hidden);
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Animation.requestRendering?.();
		Animation.history.save({
			type: 'animation-layer-hidden',
			motion: getAnimationStore().motion,
			direction: getAnimationStore().direction,
			item: item,
			oldValues: backups,
			newValue: !hidden
		});
	};

const onLayerLockPointerdown =
	(item: LayerExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { locked } = item;
		const backups = list.setRecursiveStates(item, 'locked', !locked);
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Animation.history.save({
			type: 'animation-layer-locked',
			motion: getAnimationStore().motion,
			direction: getAnimationStore().direction,
			item: item,
			oldValues: backups,
			newValue: !locked
		});
	};

const layerNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as LayerExtrasNode;
	return [
		h(
			'span',
			{
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onLayerVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		),
		h(
			'span',
			{
				class: ['lock-icon', { 'node-icon-highlight': !!node.locked }],
				onPointerdown: onLayerLockPointerdown(node, container)
			},
			node.locked ? '\uf023' : '\uf09c'
		)
	];
};

const layerNodeIcon = (item: unknown): VNode[] => {
	const node = item as LayerExtrasNode & { class?: string };
	const classes = {
		joint: 'anim-layer-joint',
		sprite: 'anim-layer-sprite',
		particle: 'anim-layer-particle',
		sound: 'anim-layer-sound'
	} as Record<string, string>;
	return [h('span', { class: ['node-icon', classes[node.class ?? ''] ?? ''] })];
};

const onLayerListSelect = (event: Event & { value?: unknown }) => {
	Animation?.layerListSelect?.(event);
};
const onLayerListRecord = (event: Event & { value?: unknown }) => {
	Animation?.layerListRecord?.(event);
};
const onLayerListPopup = (event: Event & { value?: unknown }) => {
	Animation?.layerListPopup?.(event);
};
const onLayerListChange = (event: Event) => {
	Animation?.layerListChange?.(event);
};
const onTimelineToolbarPointerdown = (event: PointerEvent) => {
	Animation?.timelineToolbarPointerdown?.(event);
};
</script>
