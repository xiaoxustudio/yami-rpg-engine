<template>
	<component :is="'group'" v-if="node !== null" class="group" :class="splitClass">
		<template v-if="node.kind === 'split'">
			<LayoutTreeView v-for="child in node.children" :key="child.id" :node="child" />
		</template>
		<template v-else>
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
