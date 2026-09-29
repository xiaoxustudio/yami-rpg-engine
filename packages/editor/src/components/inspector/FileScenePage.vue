<template>
	<FileScenePropertiesSection />
	<FileSceneMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useFileScenePage } from '@app/composables/useFileScenePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
import { fileSceneContextKey } from './file-scene/context.ts';
import FileScenePropertiesSection from './file-scene/FileScenePropertiesSection.vue';
import FileSceneMetaSection from './file-scene/FileSceneMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileScenePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileSceneContextKey, { form, onParamInput });

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.fileScene;
	if (!editor) return;
	const el = inspectorEls.get('fileScene-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	const owner = editor.owner;
	const elements = registryElements(inspectorEls, [
		'fileScene-tileWidth',
		'fileScene-tileHeight',
		'fileScene-ambient-red',
		'fileScene-ambient-green',
		'fileScene-ambient-blue',
		'fileScene-ambient-direct'
	]);
	const sliders = registryElements(inspectorEls, [
		'fileScene-ambient-red-slider',
		'fileScene-ambient-green-slider',
		'fileScene-ambient-blue-slider',
		'fileScene-ambient-direct-slider'
	]);
	bindInput(elements, editor, owner);
	bindSliders(sliders);

	sync();
});
</script>

<style>
#fileScene-ambient-red-slider,
#fileScene-ambient-green-slider,
#fileScene-ambient-blue-slider,
#fileScene-ambient-direct-slider {
	flex: 2 1 auto;
}

#fileScene-ambient-red,
#fileScene-ambient-green,
#fileScene-ambient-blue,
#fileScene-ambient-direct {
	flex: 1 1 auto;
}
</style>
