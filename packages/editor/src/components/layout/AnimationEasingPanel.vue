<template>
	<div class="page-frame" id="animation-easing" :ref="bind('easing')" value="animation-easing">
		<div class="box" id="animation-easing-head" :ref="bind('easingHead')">
			<div
				class="item toolbar-item"
				id="animation-easing-settings"
				:ref="bind('easingSettings')"
				value="bezier"
			></div>
			<SelectBox
				id="animation-easing-id"
				:ref="bind('easingId')"
				@write="onEasingIdWrite"
				@input="onEasingIdInput"
			></SelectBox>
		</div>
		<canvas
			id="animation-easing-canvas"
			:ref="bind('easingCanvas')"
			width="0"
			height="0"
		></canvas>
	</div>
</template>

<script setup lang="ts">
import { animationNodes } from '@app/composables/animation-nodes';
import { onUnmounted } from 'vue';
import SelectBox from '@app/components/common/SelectBox.vue';
import { getLazyWindow } from '@app/tools/window-registry';

const loadCluster = () => import('@app/tools/window-cluster');
const Curve = getLazyWindow('curve', () => loadCluster().then((m) => m.Curve));

const onEasingIdWrite = (value: unknown) => {
	Curve?.easingIdWrite?.({ value });
};
const onEasingIdInput = (value: unknown) => {
	Curve?.easingIdInput?.({ value });
};
const { bind, dispose } = animationNodes.scoped();
onUnmounted(dispose);
</script>
