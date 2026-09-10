<template>
	<Teleport :to="container ?? undefined" :disabled="container === null">
		<slot />
	</Teleport>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, onMounted, shallowRef } from 'vue';
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

// M5 收尾：Teleport 目标恒为「稳定元素」——归属存在时是叶子宿主，否则回落本组件所在容器
// （原地渲染）。此前用 `:to="target ?? 'body'"` + `:disabled` 切换，在「清空归属」的 patch 里
// Vue moveTeleport 会以 null 容器搬运（真机 `insertBefore of null`，见 layout.ts 重建步骤）。
const instance = getCurrentInstance();
const localContainer = shallowRef<HTMLElement | null>(null);

onMounted(() => {
	// 组件的 vnode.el 是 Teleport 落点锚（注释/文本节点），其 parentNode 即本组件所在容器
	const anchor = instance?.vnode.el as Node | null | undefined;
	const parent = anchor?.parentNode ?? null;
	localContainer.value = parent instanceof HTMLElement ? parent : null;
});

const target = computed<HTMLElement | null>(() => {
	const candidate =
		props.source === 'tab' ? store.tabTargets[props.value] : store.pageTargets[props.value];
	if (candidate === undefined || candidate === null) return null;
	// 重建/重挂载窗口内旧叶子可能已脱离文档：此时退回原地渲染，避免搬进死容器
	return candidate.isConnected ? candidate : null;
});

const container = computed<HTMLElement | null>(() => target.value ?? localContainer.value);
</script>
