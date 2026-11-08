<template>
	<div class="page-frame" id="particle" :ref="bind('page')" value="particle">
		<div
			class="box"
			id="particle-head"
			:ref="bind('head')"
			@pointerdown="onParticleHeadPointerdown"
		>
			<div class="box" id="particle-head-start" @pointerdown="onParticleViewPointerdown">
				<div
					class="item toolbar-item"
					id="particle-view-wireframe"
					v-tip="t('components.particle-view-wireframe.tip')"
					:ref="bind('viewWireframe')"
					value="wireframe"
				></div>
				<div
					class="item toolbar-item"
					id="particle-view-anchor"
					v-tip="t('components.particle-view-anchor.tip')"
					:ref="bind('viewAnchor')"
					value="anchor"
				></div>
			</div>
			<div class="box" id="particle-head-center">
				<div class="box" id="particle-control" @pointerdown="onParticleControlPointerdown">
					<div
						class="item toolbar-item"
						id="particle-control-restart"
						v-tip="t('components.particle-control-restart.tip')"
						:ref="bind('controlRestart')"
						value="restart"
						hotkey="R"
					></div>
					<div
						class="item toolbar-item"
						id="particle-control-pause"
						v-tip="t('components.particle-control-pause.tip')"
						:ref="bind('controlPause')"
						value="pause"
						hotkey="P"
					></div>
				</div>
				<NumberBox
					id="particle-speed"
					v-tip="t('components.particle-speed.tip')"
					:ref="bind('speed')"
					min="0"
					max="4"
					step="0.05"
					decimals="2"
					><div class="text label">speed:</div></NumberBox
				>
			</div>
			<div class="box" id="particle-head-end">
				<SliderBox
					id="particle-zoom"
					:ref="bind('zoom')"
					name="zoom"
					min="0"
					max="4"
					hotkey="-/+"
					active-wheel
					@input="onParticleZoomInput"
					@focus="onParticleZoomFocus"
				></SliderBox>
			</div>
		</div>
		<div class="box" id="particle-body" :ref="bind('body')">
			<div
				class="box"
				id="particle-screen"
				:ref="bind('screen')"
				tabindex="-1"
				@keydown="onParticleScreenKeydown"
				@wheel="onParticleScreenWheel"
			>
				<MarqueeArea
					id="particle-marquee"
					:ref="bind('marquee')"
					@pointerdown="onParticleMarqueePointerdown"
				></MarqueeArea>
			</div>
			<div class="text" id="particle-info" :ref="bind('info')"></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { particlePanelNodes } from '@app/composables/particle-nodes';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import { getLazyWindow } from '@app/tools/window-registry';

const { bind, dispose } = particlePanelNodes.scoped();
onUnmounted(dispose);

const { t } = useI18n();

const loadCluster = () => import('@app/tools/window-cluster');
const Particle = getLazyWindow('particle', () => loadCluster().then((m) => m.Particle));

const onParticleHeadPointerdown = (event: PointerEvent) => {
	Particle?.headPointerdown?.(event);
};
const onParticleViewPointerdown = (event: PointerEvent) => {
	Particle?.viewPointerdown?.(event);
};
const onParticleControlPointerdown = (event: PointerEvent) => {
	Particle?.controlPointerdown?.(event);
};
const onParticleZoomInput = (value: number) => {
	Particle?.setZoom?.(value);
};
const onParticleZoomFocus = () => {
	Particle?.zoomFocus?.();
};
const onParticleScreenKeydown = (event: KeyboardEvent) => {
	Particle?.screenKeydown?.(event);
};
const onParticleScreenWheel = (event: WheelEvent) => {
	Particle?.screenWheel?.(event);
};
const onParticleMarqueePointerdown = (event: PointerEvent) => {
	Particle?.marqueePointerdown?.(event);
};
</script>
