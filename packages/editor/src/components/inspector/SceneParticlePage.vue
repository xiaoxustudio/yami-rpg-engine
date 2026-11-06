<template>
	<SceneParticlePropertiesSection />
	<SceneParticleMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { registryElements } from '@app/utils/element-registry';
import { inspectorEls } from '@app/inspector/element-registry.ts';
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
		const elements = registryElements(inspectorEls, [
			'sceneParticle-name',
			'sceneParticle-particleId',
			'sceneParticle-x',
			'sceneParticle-y',
			'sceneParticle-angle',
			'sceneParticle-scale',
			'sceneParticle-speed',
			'sceneParticle-opacity',
			'sceneParticle-priority'
		]);
		const sliders = registryElements(inspectorEls, [
			'sceneParticle-angle-slider',
			'sceneParticle-scale-slider',
			'sceneParticle-speed-slider',
			'sceneParticle-opacity-slider',
			'sceneParticle-priority-slider'
		]);
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
