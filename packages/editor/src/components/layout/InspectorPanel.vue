<template>
	<div class="page-frame" id="inspector" :ref="bind('panel')" value="inspector">
		<PageManager id="inspector-page-manager" :ref="bind('pageManager')" tabindex="-1">
			<div
				v-for="frame in inspectorMountFrames"
				:key="frame.value"
				class="page-frame"
				:id="frame.id"
				:value="frame.value"
				:ref="frameRef(frame)"
			></div>
		</PageManager>
	</div>
</template>

<script setup lang="ts">
import { inspectorEls } from '@app/inspector/element-registry';
import { registryRef } from '@app/utils/element-registry';
import { inspectorPanelNodes } from '@app/composables/page-shell-nodes';
import {
	inspectorMountFrames,
	type InspectorMountFrame
} from '@app/components/inspector/inspector-pages';
import PageManager from '@app/components/common/PageManager.vue';

// 面板根与页面管理器交给 inspector 单例（读表）；其余挂载帧仍按各自注册表登记
const { bind } = inspectorPanelNodes.scoped();

const frameRef = (frame: InspectorMountFrame): ((el: unknown) => void) | undefined => {
	if (frame.registry === 'inspector') return registryRef(inspectorEls, frame.id);
	return undefined;
};
</script>
