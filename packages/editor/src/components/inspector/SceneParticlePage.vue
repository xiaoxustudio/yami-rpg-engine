<template>
	<SceneParticlePropertiesSection />
	<SceneParticleMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { sceneParticlePageNodes } from '@app/composables/inspector-page-nodes';
import { useSceneParticlePage } from '@app/composables/useSceneParticlePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { sceneParticleContextKey } from './scene-particle/context.ts';
import SceneParticlePropertiesSection from './scene-particle/SceneParticlePropertiesSection.vue';
import SceneParticleMetaSection from './scene-particle/SceneParticleMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useSceneParticlePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneParticleContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneParticle;
	if (!editor) return;
	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.sceneParticle.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.sceneParticle.reset(bridgeApi));
	try {
		const elements = [
			sceneParticlePageNodes.pick('name'),
			sceneParticlePageNodes.pick('particleId'),
			sceneParticlePageNodes.pick('x'),
			sceneParticlePageNodes.pick('y'),
			sceneParticlePageNodes.pick('angle'),
			sceneParticlePageNodes.pick('scale'),
			sceneParticlePageNodes.pick('speed'),
			sceneParticlePageNodes.pick('opacity'),
			sceneParticlePageNodes.pick('priority')
		].filter((el): el is HTMLElement => el != null);
		const sliders = [
			sceneParticlePageNodes.pick('angleSlider'),
			sceneParticlePageNodes.pick('scaleSlider'),
			sceneParticlePageNodes.pick('speedSlider'),
			sceneParticlePageNodes.pick('opacitySlider'),
			sceneParticlePageNodes.pick('prioritySlider')
		].filter((el): el is HTMLElement => el != null);
		bindInput(elements, editor, Scene);
		bindSliders(sliders);
	} catch (e) {
		console.warn('[SceneParticlePage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>

<style>
#sceneParticle-angle-slider,
#sceneParticle-scale-slider,
#sceneParticle-speed-slider,
#sceneParticle-opacity-slider,
#sceneParticle-priority-slider {
	flex: 2 1 auto;
}

#sceneParticle-angle,
#sceneParticle-scale,
#sceneParticle-speed,
#sceneParticle-opacity,
#sceneParticle-priority {
	flex: 1 1 auto;
}
</style>
