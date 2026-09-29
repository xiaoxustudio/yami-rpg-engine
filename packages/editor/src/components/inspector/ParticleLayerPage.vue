<template>
	<ParticleLayerGeneralSection />
	<ParticleLayerAnchorSection />
	<ParticleLayerMovementSection />
	<ParticleLayerRotationSection />
	<ParticleLayerHRotationSection />
	<ParticleLayerScaleSection />
	<ParticleLayerRenderingSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { Inspector } from '@app/inspector/inspector.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { useParticleLayerPage } from '@app/composables/useParticleLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { attachElementApi } from '@app/utils/attach-element-api';
import { particleLayerContextKey } from './particle-layer/context.ts';
import ParticleLayerGeneralSection from './particle-layer/ParticleLayerGeneralSection.vue';
import ParticleLayerAnchorSection from './particle-layer/ParticleLayerAnchorSection.vue';
import ParticleLayerMovementSection from './particle-layer/ParticleLayerMovementSection.vue';
import ParticleLayerRotationSection from './particle-layer/ParticleLayerRotationSection.vue';
import ParticleLayerHRotationSection from './particle-layer/ParticleLayerHRotationSection.vue';
import ParticleLayerScaleSection from './particle-layer/ParticleLayerScaleSection.vue';
import ParticleLayerRenderingSection from './particle-layer/ParticleLayerRenderingSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useParticleLayerPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(particleLayerContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.particleLayer;
	if (!editor) return;

	const el = inspectorEls.get('particleLayer-vue-mount');
	if (el) {
		attachElementApi(el, { sync, form });
	}
	const elements = registryElements(inspectorEls, [
		'particleLayer-name',
		'particleLayer-area-type',
		'particleLayer-area-x',
		'particleLayer-area-y',
		'particleLayer-area-width',
		'particleLayer-area-height',
		'particleLayer-area-radius',
		'particleLayer-count',
		'particleLayer-delay',
		'particleLayer-interval',
		'particleLayer-lifetime',
		'particleLayer-lifetimeDev',
		'particleLayer-fadeout',
		'particleLayer-anchor-x-0',
		'particleLayer-anchor-x-1',
		'particleLayer-anchor-y-0',
		'particleLayer-anchor-y-1',
		'particleLayer-anchor-speedX-0',
		'particleLayer-anchor-speedX-1',
		'particleLayer-anchor-speedY-0',
		'particleLayer-anchor-speedY-1',
		'particleLayer-movement-angle-0',
		'particleLayer-movement-angle-1',
		'particleLayer-movement-speed-0',
		'particleLayer-movement-speed-1',
		'particleLayer-movement-accelAngle-0',
		'particleLayer-movement-accelAngle-1',
		'particleLayer-movement-accel-0',
		'particleLayer-movement-accel-1',
		'particleLayer-rotation-angle-0',
		'particleLayer-rotation-angle-1',
		'particleLayer-rotation-speed-0',
		'particleLayer-rotation-speed-1',
		'particleLayer-rotation-accel-0',
		'particleLayer-rotation-accel-1',
		'particleLayer-hRotation-radius-0',
		'particleLayer-hRotation-radius-1',
		'particleLayer-hRotation-expansionSpeed-0',
		'particleLayer-hRotation-expansionSpeed-1',
		'particleLayer-hRotation-expansionAccel-0',
		'particleLayer-hRotation-expansionAccel-1',
		'particleLayer-hRotation-angle-0',
		'particleLayer-hRotation-angle-1',
		'particleLayer-hRotation-angularSpeed-0',
		'particleLayer-hRotation-angularSpeed-1',
		'particleLayer-hRotation-angularAccel-0',
		'particleLayer-hRotation-angularAccel-1',
		'particleLayer-scale-factor-0',
		'particleLayer-scale-factor-1',
		'particleLayer-scale-speed-0',
		'particleLayer-scale-speed-1',
		'particleLayer-scale-accel-0',
		'particleLayer-scale-accel-1',
		'particleLayer-image',
		'particleLayer-blend',
		'particleLayer-light',
		'particleLayer-sort',
		'particleLayer-sprite-mode',
		'particleLayer-sprite-hframes',
		'particleLayer-sprite-vframes',
		'particleLayer-sprite-interval',
		'particleLayer-color-mode',
		'particleLayer-color-rgba-0',
		'particleLayer-color-rgba-1',
		'particleLayer-color-rgba-2',
		'particleLayer-color-rgba-3',
		'particleLayer-color-min-0',
		'particleLayer-color-min-1',
		'particleLayer-color-min-2',
		'particleLayer-color-min-3',
		'particleLayer-color-max-0',
		'particleLayer-color-max-1',
		'particleLayer-color-max-2',
		'particleLayer-color-max-3',
		'particleLayer-color-easingId',
		'particleLayer-color-startMin-0',
		'particleLayer-color-startMin-1',
		'particleLayer-color-startMin-2',
		'particleLayer-color-startMin-3',
		'particleLayer-color-startMax-0',
		'particleLayer-color-startMax-1',
		'particleLayer-color-startMax-2',
		'particleLayer-color-startMax-3',
		'particleLayer-color-endMin-0',
		'particleLayer-color-endMin-1',
		'particleLayer-color-endMin-2',
		'particleLayer-color-endMin-3',
		'particleLayer-color-endMax-0',
		'particleLayer-color-endMax-1',
		'particleLayer-color-endMax-2',
		'particleLayer-color-endMax-3',
		'particleLayer-color-tint-0',
		'particleLayer-color-tint-1',
		'particleLayer-color-tint-2',
		'particleLayer-color-tint-3'
	]);
	const sliders = registryElements(inspectorEls, [
		'particleLayer-color-tint-0-slider',
		'particleLayer-color-tint-1-slider',
		'particleLayer-color-tint-2-slider',
		'particleLayer-color-tint-3-slider'
	]);
	bindInput(elements, editor, Particle as { history: unknown });
	bindSliders(sliders);

	sync();
});
</script>
