<template>
	<component :is="'group'" v-if="node !== null" class="group" :class="splitClass">
		<template v-if="node.kind === 'split'">
			<LayoutTreeView v-for="child in node.children" :key="child.id" :node="child" />
		</template>
		<template v-else>
			<!-- C.5#1（M3b-1）：叶子宿主改由 YMNavBar/YMPageManager .vue 渲染。
				onMounted 后组件把 read/write/on/switch/index/active 等命令式 API 直接挂到
				root 元素（nav-bar / page-manager.group-manager），布局引擎可零改动继续命令式驱动 -->
			<YMNavBar />
			<YMPageManager class="group-manager" />
		</template>
		<component :is="'group-border'" class="group-border" />
	</component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { YMNavBar, YMPageManager } from '@ui-kit';
import type { LayoutTreeNode } from '@app/engine/layout/layout-scheme';

interface Props {
	node: LayoutTreeNode | null;
}

const props = withDefaults(defineProps<Props>(), { node: null });

const splitClass = computed(() => (props.node?.kind === 'split' ? props.node.split : ''));
</script>
