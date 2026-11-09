<template>
	<SceneAnimationPropertiesSection />
	<SceneAnimationMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { sceneAnimationPageNodes } from '@app/composables/inspector-page-nodes';
import { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { sceneAnimationContextKey } from './scene-animation/context.ts';
import SceneAnimationPropertiesSection from './scene-animation/SceneAnimationPropertiesSection.vue';
import SceneAnimationMetaSection from './scene-animation/SceneAnimationMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useSceneAnimationPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneAnimationContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneAnimation;
	if (!editor) return;
	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.sceneAnimation.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.sceneAnimation.reset(bridgeApi));
	const elements = [
		sceneAnimationPageNodes.pick('name'),
		sceneAnimationPageNodes.pick('animationId'),
		sceneAnimationPageNodes.pick('motion'),
		sceneAnimationPageNodes.pick('rotatable'),
		sceneAnimationPageNodes.pick('x'),
		sceneAnimationPageNodes.pick('y'),
		sceneAnimationPageNodes.pick('angle'),
		sceneAnimationPageNodes.pick('scale'),
		sceneAnimationPageNodes.pick('speed'),
		sceneAnimationPageNodes.pick('opacity'),
		sceneAnimationPageNodes.pick('priority')
	].filter((el): el is HTMLElement => el != null);
	const sliders = [
		sceneAnimationPageNodes.pick('angleSlider'),
		sceneAnimationPageNodes.pick('scaleSlider'),
		sceneAnimationPageNodes.pick('speedSlider'),
		sceneAnimationPageNodes.pick('opacitySlider'),
		sceneAnimationPageNodes.pick('prioritySlider')
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, editor, Scene);
	bindSliders(sliders);

	sync();
});
</script>

<style>
#sceneAnimation-angle-slider,
#sceneAnimation-scale-slider,
#sceneAnimation-speed-slider,
#sceneAnimation-opacity-slider,
#sceneAnimation-priority-slider {
	flex: 2 1 auto;
}

#sceneAnimation-angle,
#sceneAnimation-scale,
#sceneAnimation-speed,
#sceneAnimation-opacity,
#sceneAnimation-priority {
	flex: 1 1 auto;
}
</style>
