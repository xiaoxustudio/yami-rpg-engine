<template>
	<SceneLightPropertiesSection />
	<SceneLightMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneLightPage } from '@app/composables/useSceneLightPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
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
	const el = inspectorEls.get('sceneLight-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	try {
		const elements = registryElements(inspectorEls, [
			'sceneLight-name',
			'sceneLight-type',
			'sceneLight-blend',
			'sceneLight-x',
			'sceneLight-y',
			'sceneLight-range',
			'sceneLight-intensity',
			'sceneLight-mask',
			'sceneLight-anchorX',
			'sceneLight-anchorY',
			'sceneLight-width',
			'sceneLight-height',
			'sceneLight-angle',
			'sceneLight-red',
			'sceneLight-green',
			'sceneLight-blue',
			'sceneLight-direct'
		]);
		const sliders = registryElements(inspectorEls, [
			'sceneLight-range-slider',
			'sceneLight-intensity-slider',
			'sceneLight-anchorX-slider',
			'sceneLight-anchorY-slider',
			'sceneLight-width-slider',
			'sceneLight-height-slider',
			'sceneLight-angle-slider',
			'sceneLight-red-slider',
			'sceneLight-green-slider',
			'sceneLight-blue-slider',
			'sceneLight-direct-slider'
		]);
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
