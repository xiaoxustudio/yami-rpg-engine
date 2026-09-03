<template>
	<LayoutPalettePage v-if="active" :value="value" :source="source">
		<slot />
	</LayoutPalettePage>
	<slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLayoutVueRenderMode } from '@app/engine/layout/layout.ts';
import LayoutPalettePage from './LayoutPalettePage.vue';

// M3b-2b LayoutPanel 接线件（docs/layout-vue-plan.md 附录 F）：
// 默认（teleport 模式关）时是透传组件——slot 原样内联渲染，DOM/结构与现状一致；
// teleport 模式（YM_LAYOUT_VUE_RENDER=teleport）下把单个整壳节点交给
// LayoutPalettePage（source='page' 页 → manager、source='tab' 页签 → nav）做归属搬家。
// 引擎门控是会话级常量，运行期不切换，active 用一次求值即可。

interface Props {
	value: string;
	source: 'page' | 'tab';
}

const props = defineProps<Props>();

const active = computed(() => getLayoutVueRenderMode() === 2 && props.value !== '');
</script>
