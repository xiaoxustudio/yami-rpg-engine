<template>
	<SceneLightPropertiesSection />
	<SceneLightMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { sceneLightNodes } from '@app/composables/inspector-page-nodes';
import { useSceneLightPage } from '@app/composables/useSceneLightPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { sceneLightContextKey } from './scene-light/context.ts';
import SceneLightPropertiesSection from './scene-light/SceneLightPropertiesSection.vue';
import SceneLightMetaSection from './scene-light/SceneLightMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useSceneLightPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneLightContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneLight;
	if (!editor) return;
	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.sceneLight.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.sceneLight.reset(bridgeApi));
	try {
		const elements = [
			sceneLightNodes.pick('name'),
			sceneLightNodes.pick('type'),
			sceneLightNodes.pick('blend'),
			sceneLightNodes.pick('x'),
			sceneLightNodes.pick('y'),
			sceneLightNodes.pick('range'),
			sceneLightNodes.pick('intensity'),
			sceneLightNodes.pick('mask'),
			sceneLightNodes.pick('anchorX'),
			sceneLightNodes.pick('anchorY'),
			sceneLightNodes.pick('width'),
			sceneLightNodes.pick('height'),
			sceneLightNodes.pick('angle'),
			sceneLightNodes.pick('red'),
			sceneLightNodes.pick('green'),
			sceneLightNodes.pick('blue'),
			sceneLightNodes.pick('direct')
		].filter((el): el is HTMLElement => el != null);
		const sliders = [
			sceneLightNodes.pick('rangeSlider'),
			sceneLightNodes.pick('intensitySlider'),
			sceneLightNodes.pick('anchorXSlider'),
			sceneLightNodes.pick('anchorYSlider'),
			sceneLightNodes.pick('widthSlider'),
			sceneLightNodes.pick('heightSlider'),
			sceneLightNodes.pick('angleSlider'),
			sceneLightNodes.pick('redSlider'),
			sceneLightNodes.pick('greenSlider'),
			sceneLightNodes.pick('blueSlider'),
			sceneLightNodes.pick('directSlider')
		].filter((el): el is HTMLElement => el != null);
		bindInput(elements, editor, Scene);
		bindSliders(sliders);
	} catch (e) {
		console.warn('[SceneLightPage] init skipped:', (e as Error)?.message);
	}

	sync();
});
</script>

<style>
#sceneLight-range-slider,
#sceneLight-intensity-slider,
#sceneLight-anchorX-slider,
#sceneLight-anchorY-slider,
#sceneLight-width-slider,
#sceneLight-height-slider,
#sceneLight-angle-slider,
#sceneLight-red-slider,
#sceneLight-green-slider,
#sceneLight-blue-slider,
#sceneLight-direct-slider {
	flex: 2 1 auto;
}

#sceneLight-range,
#sceneLight-intensity,
#sceneLight-anchorX,
#sceneLight-anchorY,
#sceneLight-width,
#sceneLight-height,
#sceneLight-angle,
#sceneLight-red,
#sceneLight-green,
#sceneLight-blue,
#sceneLight-direct {
	flex: 1 1 auto;
}
</style>
