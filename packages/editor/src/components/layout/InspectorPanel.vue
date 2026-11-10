<template>
	<div class="page-frame" id="inspector" :ref="bind('panel')" value="inspector">
		<PageManager id="inspector-page-manager" :ref="bind('pageManager')" tabindex="-1">
			<div
				v-for="frame in inspectorMountFrames"
				:key="frame.value"
				class="page-frame"
				:id="frame.id"
				:value="frame.value"
			></div>
		</PageManager>
	</div>
</template>

<script setup lang="ts">
import { inspectorPanelNodes } from '@app/composables/page-shell-nodes';
import { inspectorMountFrames } from '@app/components/inspector/inspector-pages';
import PageManager from '@app/components/common/PageManager.vue';

// 面板根与页面管理器交给 inspector 单例（读表）。
// 挂载帧的 id 由页管理器渲染，页面组件按 DOM id 取（`inspectorPageRoots.pick` 的兜底）；
// 这里不再挂 ref —— `inspectorEls` 的读者已归零，登记只会留下一份会过期的副本。
const { bind } = inspectorPanelNodes.scoped();
</script>
