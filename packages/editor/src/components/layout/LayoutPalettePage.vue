<template>
	<Teleport :to="target ?? 'body'" :disabled="target === null">
		<slot />
	</Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getLayoutStore } from '@app/stores/layout';

interface Props {
	value: string;
	/**
	 * 归属表来源：'page'（默认，页归属 store.pageTargets：value → group-manager）
	 * 或 'tab'（页签归属 store.tabTargets：value → leaf nav）。见 docs/layout-vue-plan.md 附录 F.1。
	 */
	source?: 'page' | 'tab';
}

const props = withDefaults(defineProps<Props>(), { source: 'page' });

const store = getLayoutStore();
const target = computed<HTMLElement | null>(() =>
	props.source === 'tab'
		? (store.tabTargets[props.value] ?? null)
		: (store.pageTargets[props.value] ?? null)
);
</script>
