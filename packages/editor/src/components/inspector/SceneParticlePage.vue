<template>
	<SceneParticlePropertiesSection />
	<SceneParticleMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneParticlePage } from '@app/composables/useSceneParticlePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
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
	const el = inspectorEls.get('sceneParticle-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
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
