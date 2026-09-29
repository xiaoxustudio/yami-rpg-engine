<template>
	<div class="page-frame" id="particle-layer" value="particle-layer">
		<TreeList
			id="particle-list"
			:ref="registryRef(particleEls, 'particle-list')"
			padded
			:node-extras="particleNodeExtras"
			:node-icon-renderer="particleNodeIcon"
		></TreeList>
	</div>
</template>

<script setup lang="ts">
import { h, type VNode } from 'vue';
import { particleEls } from '@app/particle/element-registry';
import { registryRef } from '@app/utils/element-registry';
import TreeList from '@app/components/common/TreeList.vue';
import { getLazyWindow } from '@app/tools/window-registry';
import { File } from '@app/file/file-system-core.ts';
import { setIconClip } from '@app/utils/icon-clip';

const loadCluster = () => import('@app/tools/window-cluster');
const Particle = getLazyWindow('particle', () => loadCluster().then((m) => m.Particle));

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

const onParticleVisibilityPointerdown =
	(item: LayerExtrasNode, container: HTMLElement) => (event: PointerEvent) => {
		if (event.button !== 0) return;
		const list = container.closest('.tree-list') as ExtrasListElement | null;
		if (!list) return;
		const { hidden } = item;
		item.hidden = !hidden;
		list.update();
		list.dispatchEvent(new Event('change', { bubbles: true }));
		Particle.requestRendering?.();
		Particle.history!.save({
			type: 'particle-layer-hidden',
			item: item,
			oldValue: hidden,
			newValue: !hidden
		});
	};

const particleNodeExtras = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as LayerExtrasNode;
	return [
		h(
			'span',
			{
				style: { right: '0' },
				class: ['visibility-icon', { 'node-icon-highlight': !!node.hidden }],
				onPointerdown: onParticleVisibilityPointerdown(node, container)
			},
			node.hidden ? '\uf070' : '\uf06e'
		)
	];
};

const particleNodeIcon = (item: unknown, container: HTMLElement): VNode[] => {
	const node = item as { image?: string; sprite?: { hframes: number; vframes: number } };
	const path = File.getPath?.(node.image);
	if (path) {
		queueMicrotask(() => {
			const icon = container.querySelector('.node-icon') as HTMLElement | null;
			if (icon) {
				setIconClip(
					icon,
					path,
					0,
					0,
					-(node.sprite?.hframes ?? 1),
					-(node.sprite?.vframes ?? 1)
				);
			}
		});
		return [h('span', { class: ['node-icon', 'icon-particle-image'] })];
	}
	return [h('span', { class: 'node-icon' }, '\uf2dc')];
};
</script>
