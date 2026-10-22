<template>
	<SceneActorPropertiesSection />
	<SceneActorMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useEventListener } from '@app/composables/useEventListener';
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

const datachangeHandler = ref<EventListener | null>(null);
const datachangeEnabled = ref(false);
useEventListener(window, 'datachange', (event) => datachangeHandler.value?.(event), {
	enabled: datachangeEnabled
});

onMounted(() => {
	const editor = Inspector.sceneActor;
	if (!editor) return;
	const el = inspectorEls.get('sceneActor-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	datachangeHandler.value = editor.datachange as EventListener;
	datachangeEnabled.value = true;
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
