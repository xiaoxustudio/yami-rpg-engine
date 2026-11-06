<template>
	<div class="page-frame" id="animation-motion" :ref="bind('motion')" value="animation-motion">
		<div class="box" id="animation-list-head" :ref="bind('listHead')">
			<TextBox id="animation-searcher" :ref="bind('searcher')" name="search"></TextBox>
		</div>
		<TreeList
			id="animation-list"
			:ref="bind('list')"
			padded
			:node-extras="animationNodeExtras"
			:node-icon-renderer="animationNodeIcon"
			@select="onAnimationListSelect"
			@record="onAnimationListRecord"
			@open="onAnimationListOpen"
			@popup="onAnimationListPopup"
			@change="onAnimationListChange"
		></TreeList>
	</div>
</template>

<script setup lang="ts">
import { animationNodes } from '@app/composables/animation-nodes';
import { h, type VNode, onUnmounted } from 'vue';
import TextBox from '@app/components/common/TextBox.vue';
import TreeList from '@app/components/common/TreeList.vue';
import { getLazyWindow } from '@app/tools/window-registry';

const loadCluster = () => import('@app/tools/window-cluster');
const Animation = getLazyWindow('animation', () => loadCluster().then((m) => m.Animation));

const animationNodeExtras = (item: unknown): VNode[] => {
	const node = item as { loop?: boolean };
	if (node.loop) {
		return [h('span', { class: ['node-icon', 'icon-loop'] }, '\uf112')];
	}
	return [];
};

const animationNodeIcon = (_item: unknown): VNode[] => {
	return [h('span', { class: ['node-icon', 'icon-string'] })];
};

const onAnimationListSelect = (event: Event & { value?: unknown }) => {
	Animation?.listSelect?.(event);
};
const onAnimationListRecord = (event: Event & { value?: unknown }) => {
	Animation?.listRecord?.(event);
};
const onAnimationListOpen = (event: Event & { value?: unknown }) => {
	Animation?.listOpen?.(event);
};
const onAnimationListPopup = (event: Event & { value?: unknown }) => {
	Animation?.listPopup?.(event);
};
const onAnimationListChange = (event: Event) => {
	Animation?.listChange?.(event);
};
const { bind, dispose } = animationNodes.scoped();
onUnmounted(dispose);
</script>
