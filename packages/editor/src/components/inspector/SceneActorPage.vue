<template>
	<SceneActorPropertiesSection />
	<SceneActorMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, ref, onUnmounted } from 'vue';
import { sceneActorNodes } from '@app/composables/inspector-page-nodes';
import { useSceneActorPage } from '@app/composables/useSceneActorPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { useEventListener } from '@app/composables/useEventListener';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
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
	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.sceneActor.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.sceneActor.reset(bridgeApi));
	datachangeHandler.value = editor.datachange as EventListener;
	datachangeEnabled.value = true;
	const elements = [
		sceneActorNodes.pick('name'),
		sceneActorNodes.pick('type'),
		sceneActorNodes.pick('actorId'),
		sceneActorNodes.pick('teamId'),
		sceneActorNodes.pick('x'),
		sceneActorNodes.pick('y'),
		sceneActorNodes.pick('angle'),
		sceneActorNodes.pick('scale')
	].filter((el): el is HTMLElement => el != null);
	const sliders = [
		sceneActorNodes.pick('angleSlider'),
		sceneActorNodes.pick('scaleSlider')
	].filter((el): el is HTMLElement => el != null);
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
