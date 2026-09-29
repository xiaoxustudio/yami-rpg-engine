<template>
	<div
		class="page-frame"
		id="animation-easing"
		:ref="registryRef(animationEls, 'animation-easing')"
		value="animation-easing"
	>
		<div
			class="box"
			id="animation-easing-head"
			:ref="registryRef(animationEls, 'animation-easing-head')"
		>
			<div
				class="item toolbar-item"
				id="animation-easing-settings"
				:ref="registryRef(animationEls, 'animation-easing-settings')"
				value="bezier"
			></div>
			<SelectBox
				id="animation-easing-id"
				:ref="registryRef(animationEls, 'animation-easing-id')"
				@write="onEasingIdWrite"
				@input="onEasingIdInput"
			></SelectBox>
		</div>
		<canvas
			id="animation-easing-canvas"
			:ref="registryRef(animationEls, 'animation-easing-canvas')"
			width="0"
			height="0"
		></canvas>
	</div>
</template>

<script setup lang="ts">
import { animationEls } from '@app/animation/element-registry';
import { registryRef } from '@app/utils/element-registry';
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
</script>
