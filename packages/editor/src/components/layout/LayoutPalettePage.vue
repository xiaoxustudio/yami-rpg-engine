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
const target = computed<HTMLElement | null>(() => {
	const candidate =
		props.source === 'tab' ? store.tabTargets[props.value] : store.pageTargets[props.value];
	if (candidate === undefined || candidate === null) return null;
	// 重建/重挂载窗口内旧叶子可能已脱离文档：此时退回「原地渲染」，
	// 避免 Teleport 向已分离容器搬运（真机曾报 moveTeleport: insertBefore of null）。
	return candidate.isConnected ? candidate : null;
});
</script>
