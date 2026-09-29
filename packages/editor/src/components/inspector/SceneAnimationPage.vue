<template>
	<SceneAnimationPropertiesSection />
	<SceneAnimationMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneAnimationPage } from '@app/composables/useSceneAnimationPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
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
	const el = inspectorEls.get('sceneAnimation-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	const elements = registryElements(inspectorEls, [
		'sceneAnimation-name',
		'sceneAnimation-animationId',
		'sceneAnimation-motion',
		'sceneAnimation-rotatable',
		'sceneAnimation-x',
		'sceneAnimation-y',
		'sceneAnimation-angle',
		'sceneAnimation-scale',
		'sceneAnimation-speed',
		'sceneAnimation-opacity',
		'sceneAnimation-priority'
	]);
	const sliders = registryElements(inspectorEls, [
		'sceneAnimation-angle-slider',
		'sceneAnimation-scale-slider',
		'sceneAnimation-speed-slider',
		'sceneAnimation-opacity-slider',
		'sceneAnimation-priority-slider'
	]);
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
