<template>
	<SceneActorPropertiesSection />
	<SceneActorMetaSection />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { sceneActorContextKey } from './scene-actor/context.ts';
import SceneActorPropertiesSection from './scene-actor/SceneActorPropertiesSection.vue';
import SceneActorMetaSection from './scene-actor/SceneActorMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useSceneActorPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneActorContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

let datachangeHandler: EventListener | null = null;

onMounted(() => {
	const editor = Inspector.sceneActor;
	if (!editor) return;
	const el = inspectorEls.get('sceneActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	datachangeHandler = editor.datachange as EventListener;
	window.addEventListener('datachange', datachangeHandler);
	const elements = registryElements(inspectorEls, [
		'sceneActor-name',
		'sceneActor-type',
		'sceneActor-actorId',
		'sceneActor-teamId',
		'sceneActor-x',
		'sceneActor-y',
		'sceneActor-angle',
		'sceneActor-scale'
	]);
	const sliders = registryElements(inspectorEls, [
		'sceneActor-angle-slider',
		'sceneActor-scale-slider'
	]);
	bindInput(elements, editor, Scene);
	bindSliders(sliders);

	sync();
});
onBeforeUnmount(() => {
	if (datachangeHandler) window.removeEventListener('datachange', datachangeHandler);
});
</script>

<style>
#sceneActor-angle-slider,
#sceneActor-scale-slider {
	flex: 2 1 auto;
}

#sceneActor-angle,
#sceneActor-scale {
	flex: 1 1 auto;
}
</style>
