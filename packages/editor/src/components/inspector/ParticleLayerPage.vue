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
import { onMounted, provide, onUnmounted } from 'vue';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { particleLayerPageNodes } from '@app/composables/inspector-page-nodes';
import { Inspector } from '@app/inspector/inspector.ts';
import { Particle } from '@app/particle/particle-window.ts';
import { useParticleLayerPage } from '@app/composables/useParticleLayerPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
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

	const bridgeApi: PageSyncApi = { sync, form };
	inspectorPageSync.particleLayer.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.particleLayer.reset(bridgeApi));
	const elements = [
		particleLayerPageNodes.pick('name'),
		particleLayerPageNodes.pick('areaType'),
		particleLayerPageNodes.pick('areaX'),
		particleLayerPageNodes.pick('areaY'),
		particleLayerPageNodes.pick('areaWidth'),
		particleLayerPageNodes.pick('areaHeight'),
		particleLayerPageNodes.pick('areaRadius'),
		particleLayerPageNodes.pick('count'),
		particleLayerPageNodes.pick('delay'),
		particleLayerPageNodes.pick('interval'),
		particleLayerPageNodes.pick('lifetime'),
		particleLayerPageNodes.pick('lifetimeDev'),
		particleLayerPageNodes.pick('fadeout'),
		particleLayerPageNodes.pick('anchorX0'),
		particleLayerPageNodes.pick('anchorX1'),
		particleLayerPageNodes.pick('anchorY0'),
		particleLayerPageNodes.pick('anchorY1'),
		particleLayerPageNodes.pick('anchorSpeedX0'),
		particleLayerPageNodes.pick('anchorSpeedX1'),
		particleLayerPageNodes.pick('anchorSpeedY0'),
		particleLayerPageNodes.pick('anchorSpeedY1'),
		particleLayerPageNodes.pick('movementAngle0'),
		particleLayerPageNodes.pick('movementAngle1'),
		particleLayerPageNodes.pick('movementSpeed0'),
		particleLayerPageNodes.pick('movementSpeed1'),
		particleLayerPageNodes.pick('movementAccelAngle0'),
		particleLayerPageNodes.pick('movementAccelAngle1'),
		particleLayerPageNodes.pick('movementAccel0'),
		particleLayerPageNodes.pick('movementAccel1'),
		particleLayerPageNodes.pick('rotationAngle0'),
		particleLayerPageNodes.pick('rotationAngle1'),
		particleLayerPageNodes.pick('rotationSpeed0'),
		particleLayerPageNodes.pick('rotationSpeed1'),
		particleLayerPageNodes.pick('rotationAccel0'),
		particleLayerPageNodes.pick('rotationAccel1'),
		particleLayerPageNodes.pick('hRotationRadius0'),
		particleLayerPageNodes.pick('hRotationRadius1'),
		particleLayerPageNodes.pick('hRotationExpansionSpeed0'),
		particleLayerPageNodes.pick('hRotationExpansionSpeed1'),
		particleLayerPageNodes.pick('hRotationExpansionAccel0'),
		particleLayerPageNodes.pick('hRotationExpansionAccel1'),
		particleLayerPageNodes.pick('hRotationAngle0'),
		particleLayerPageNodes.pick('hRotationAngle1'),
		particleLayerPageNodes.pick('hRotationAngularSpeed0'),
		particleLayerPageNodes.pick('hRotationAngularSpeed1'),
		particleLayerPageNodes.pick('hRotationAngularAccel0'),
		particleLayerPageNodes.pick('hRotationAngularAccel1'),
		particleLayerPageNodes.pick('scaleFactor0'),
		particleLayerPageNodes.pick('scaleFactor1'),
		particleLayerPageNodes.pick('scaleSpeed0'),
		particleLayerPageNodes.pick('scaleSpeed1'),
		particleLayerPageNodes.pick('scaleAccel0'),
		particleLayerPageNodes.pick('scaleAccel1'),
		particleLayerPageNodes.pick('image'),
		particleLayerPageNodes.pick('blend'),
		particleLayerPageNodes.pick('light'),
		particleLayerPageNodes.pick('sort'),
		particleLayerPageNodes.pick('spriteMode'),
		particleLayerPageNodes.pick('spriteHframes'),
		particleLayerPageNodes.pick('spriteVframes'),
		particleLayerPageNodes.pick('spriteInterval'),
		particleLayerPageNodes.pick('colorMode'),
		particleLayerPageNodes.pick('colorRgba0'),
		particleLayerPageNodes.pick('colorRgba1'),
		particleLayerPageNodes.pick('colorRgba2'),
		particleLayerPageNodes.pick('colorRgba3'),
		particleLayerPageNodes.pick('colorMin0'),
		particleLayerPageNodes.pick('colorMin1'),
		particleLayerPageNodes.pick('colorMin2'),
		particleLayerPageNodes.pick('colorMin3'),
		particleLayerPageNodes.pick('colorMax0'),
		particleLayerPageNodes.pick('colorMax1'),
		particleLayerPageNodes.pick('colorMax2'),
		particleLayerPageNodes.pick('colorMax3'),
		particleLayerPageNodes.pick('colorEasingId'),
		particleLayerPageNodes.pick('colorStartMin0'),
		particleLayerPageNodes.pick('colorStartMin1'),
		particleLayerPageNodes.pick('colorStartMin2'),
		particleLayerPageNodes.pick('colorStartMin3'),
		particleLayerPageNodes.pick('colorStartMax0'),
		particleLayerPageNodes.pick('colorStartMax1'),
		particleLayerPageNodes.pick('colorStartMax2'),
		particleLayerPageNodes.pick('colorStartMax3'),
		particleLayerPageNodes.pick('colorEndMin0'),
		particleLayerPageNodes.pick('colorEndMin1'),
		particleLayerPageNodes.pick('colorEndMin2'),
		particleLayerPageNodes.pick('colorEndMin3'),
		particleLayerPageNodes.pick('colorEndMax0'),
		particleLayerPageNodes.pick('colorEndMax1'),
		particleLayerPageNodes.pick('colorEndMax2'),
		particleLayerPageNodes.pick('colorEndMax3'),
		particleLayerPageNodes.pick('colorTint0'),
		particleLayerPageNodes.pick('colorTint1'),
		particleLayerPageNodes.pick('colorTint2'),
		particleLayerPageNodes.pick('colorTint3')
	].filter((el): el is HTMLElement => el != null);
	const sliders = [
		particleLayerPageNodes.pick('colorTint0Slider'),
		particleLayerPageNodes.pick('colorTint1Slider'),
		particleLayerPageNodes.pick('colorTint2Slider'),
		particleLayerPageNodes.pick('colorTint3Slider')
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, editor, Particle as { history: unknown });
	bindSliders(sliders);

	sync();
});
</script>
