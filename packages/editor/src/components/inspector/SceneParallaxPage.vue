<template>
	<SceneParallaxGeneralSection />
	<SceneParallaxTransformSection />
	<SceneParallaxMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { sceneParallaxContextKey } from './scene-parallax/context.ts';
import SceneParallaxGeneralSection from './scene-parallax/SceneParallaxGeneralSection.vue';
import SceneParallaxTransformSection from './scene-parallax/SceneParallaxTransformSection.vue';
import SceneParallaxMetaSection from './scene-parallax/SceneParallaxMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useSceneParallaxPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneParallaxContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneParallax;
	if (!editor) return;
	const el = inspectorEls.get('sceneParallax-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	const elements = registryElements(inspectorEls, [
		'sceneParallax-name',
		'sceneParallax-image',
		'sceneParallax-layer',
		'sceneParallax-order',
		'sceneParallax-light',
		'sceneParallax-blend',
		'sceneParallax-opacity',
		'sceneParallax-x',
		'sceneParallax-y',
		'sceneParallax-scaleX',
		'sceneParallax-scaleY',
		'sceneParallax-repeatX',
		'sceneParallax-repeatY',
		'sceneParallax-anchorX',
		'sceneParallax-anchorY',
		'sceneParallax-offsetX',
		'sceneParallax-offsetY',
		'sceneParallax-parallaxFactorX',
		'sceneParallax-parallaxFactorY',
		'sceneParallax-shiftSpeedX',
		'sceneParallax-shiftSpeedY',
		'sceneParallax-tint-0',
		'sceneParallax-tint-1',
		'sceneParallax-tint-2',
		'sceneParallax-tint-3'
	]);
	const sliders = registryElements(inspectorEls, [
		'sceneParallax-tint-0-slider',
		'sceneParallax-tint-1-slider',
		'sceneParallax-tint-2-slider',
		'sceneParallax-tint-3-slider'
	]);
	bindInput(elements, editor, Scene);
	bindSliders(sliders);

	sync();
});
</script>

<style>
#sceneParallax-tint-0-slider,
#sceneParallax-tint-1-slider,
#sceneParallax-tint-2-slider,
#sceneParallax-tint-3-slider {
	flex: 2 1 auto;
}

#sceneParallax-tint-0,
#sceneParallax-tint-1,
#sceneParallax-tint-2,
#sceneParallax-tint-3 {
	flex: 1 1 auto;
}
</style>
