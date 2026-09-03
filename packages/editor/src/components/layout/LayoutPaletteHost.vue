<template>
	<Teleport to="body" :disabled="!active">
		<div v-if="active" class="layout-palette-holder" :style="{ display: 'none' }">
			<slot />
		</div>
		<template v-else>
			<slot />
		</template>
	</Teleport>
</template>

<script setup lang="ts">
import { getLayoutVueRenderMode } from '@app/engine/layout/layout.ts';

// M3b-2b LayoutPanel 接线件（docs/layout-vue-plan.md 附录 F）：把整个 palette 支架
// （#layout-content：NavBar#layout-nav + PageManager#layout-page-manager 及 12 页壳）
// 在 teleport 模式下搬进 body 内的隐藏容器——工作区宿主页保持为空，供引擎按
// loadLayoutSchemeVueTeleport 把 Vue 组树直接挂进宿主页（几何与命令式一致）。
// 默认（teleport 关）：透传 slot 原样内联，DOM 与现状一致。无 DOM API。

const active = getLayoutVueRenderMode() === 2;
</script>
