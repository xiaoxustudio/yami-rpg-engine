<template>
	<div
		class="page-frame"
		id="particle"
		:ref="registryRef(particleEls, 'particle')"
		value="particle"
	>
		<div
			class="box"
			id="particle-head"
			:ref="registryRef(particleEls, 'particle-head')"
			@pointerdown="onParticleHeadPointerdown"
		>
			<div class="box" id="particle-head-start" @pointerdown="onParticleViewPointerdown">
				<div
					class="item toolbar-item"
					id="particle-view-wireframe"
					v-tip="t('components.particle-view-wireframe.tip')"
					:ref="registryRef(particleEls, 'particle-view-wireframe')"
					value="wireframe"
				></div>
				<div
					class="item toolbar-item"
					id="particle-view-anchor"
					v-tip="t('components.particle-view-anchor.tip')"
					:ref="registryRef(particleEls, 'particle-view-anchor')"
					value="anchor"
				></div>
			</div>
			<div class="box" id="particle-head-center">
				<div class="box" id="particle-control" @pointerdown="onParticleControlPointerdown">
					<div
						class="item toolbar-item"
						id="particle-control-restart"
						v-tip="t('components.particle-control-restart.tip')"
						:ref="registryRef(particleEls, 'particle-control-restart')"
						value="restart"
						hotkey="R"
					></div>
					<div
						class="item toolbar-item"
						id="particle-control-pause"
						v-tip="t('components.particle-control-pause.tip')"
						:ref="registryRef(particleEls, 'particle-control-pause')"
						value="pause"
						hotkey="P"
					></div>
				</div>
				<NumberBox
					id="particle-speed"
					v-tip="t('components.particle-speed.tip')"
					:ref="registryRef(particleEls, 'particle-speed')"
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
					:ref="registryRef(particleEls, 'particle-zoom')"
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
		<div class="box" id="particle-body" :ref="registryRef(particleEls, 'particle-body')">
			<div
				class="box"
				id="particle-screen"
				:ref="registryRef(particleEls, 'particle-screen')"
				tabindex="-1"
				@keydown="onParticleScreenKeydown"
				@wheel="onParticleScreenWheel"
			>
				<MarqueeArea
					id="particle-marquee"
					:ref="registryRef(particleEls, 'particle-marquee')"
					@pointerdown="onParticleMarqueePointerdown"
				></MarqueeArea>
			</div>
			<div
				class="text"
				id="particle-info"
				:ref="registryRef(particleEls, 'particle-info')"
			></div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { particleEls } from '@app/particle/element-registry';
import { registryRef } from '@app/utils/element-registry';
import NumberBox from '@app/components/common/NumberBox.vue';
import SliderBox from '@app/components/common/SliderBox.vue';
import MarqueeArea from '@app/components/common/MarqueeArea.vue';
import { getLazyWindow } from '@app/tools/window-registry';

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
