<template>
	<LayoutPalettePage v-if="active" :value="value" :source="source">
		<slot />
	</LayoutPalettePage>
	<slot v-else />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LayoutPalettePage from './LayoutPalettePage.vue';

// M5-b（layout 迁移规划 M5）：整壳 Teleport 已是唯一形态——
// 单个整壳节点（.nav-item / .page-frame）交给 LayoutPalettePage
// （source='page' 页 → manager、source='tab' 页签 → nav）做归属搬家。

interface Props {
	value: string;
	source: 'page' | 'tab';
}

const props = defineProps<Props>();

const active = computed(() => props.value !== '');
</script>
