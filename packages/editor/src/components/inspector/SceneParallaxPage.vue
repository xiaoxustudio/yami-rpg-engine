<template>
	<SceneParallaxGeneralSection />
	<SceneParallaxTransformSection />
	<SceneParallaxMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { sceneParallaxPageNodes } from '@app/composables/inspector-page-nodes';
import { useSceneParallaxPage } from '@app/composables/useSceneParallaxPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
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
	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.sceneParallax.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.sceneParallax.reset(bridgeApi));
	const elements = [
		sceneParallaxPageNodes.pick('name'),
		sceneParallaxPageNodes.pick('image'),
		sceneParallaxPageNodes.pick('layer'),
		sceneParallaxPageNodes.pick('order'),
		sceneParallaxPageNodes.pick('light'),
		sceneParallaxPageNodes.pick('blend'),
		sceneParallaxPageNodes.pick('opacity'),
		sceneParallaxPageNodes.pick('x'),
		sceneParallaxPageNodes.pick('y'),
		sceneParallaxPageNodes.pick('scaleX'),
		sceneParallaxPageNodes.pick('scaleY'),
		sceneParallaxPageNodes.pick('repeatX'),
		sceneParallaxPageNodes.pick('repeatY'),
		sceneParallaxPageNodes.pick('anchorX'),
		sceneParallaxPageNodes.pick('anchorY'),
		sceneParallaxPageNodes.pick('offsetX'),
		sceneParallaxPageNodes.pick('offsetY'),
		sceneParallaxPageNodes.pick('parallaxFactorX'),
		sceneParallaxPageNodes.pick('parallaxFactorY'),
		sceneParallaxPageNodes.pick('shiftSpeedX'),
		sceneParallaxPageNodes.pick('shiftSpeedY'),
		sceneParallaxPageNodes.pick('tint0'),
		sceneParallaxPageNodes.pick('tint1'),
		sceneParallaxPageNodes.pick('tint2'),
		sceneParallaxPageNodes.pick('tint3')
	].filter((el): el is HTMLElement => el != null);
	const sliders = [
		sceneParallaxPageNodes.pick('tint0Slider'),
		sceneParallaxPageNodes.pick('tint1Slider'),
		sceneParallaxPageNodes.pick('tint2Slider'),
		sceneParallaxPageNodes.pick('tint3Slider')
	].filter((el): el is HTMLElement => el != null);
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
