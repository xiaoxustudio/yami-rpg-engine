<template>
	<FileScenePropertiesSection />
	<FileSceneMetaSection />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, provide } from 'vue';
import { useFileScenePage } from '@app/composables/useFileScenePage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import {
	FILE_SCENE_CONTROLS_KEY,
	provideFileScenePage,
	resetFileScenePage,
	type FileSceneControls,
	type FileScenePageApi
} from '@app/composables/file-scene-page-bridge';
import { toControl } from '@app/composables/control-refs';
import { fileSceneContextKey } from './file-scene/context.ts';
import FileScenePropertiesSection from './file-scene/FileScenePropertiesSection.vue';
import FileSceneMetaSection from './file-scene/FileSceneMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileScenePage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileSceneContextKey, { form, onParamInput });

/** 页面建表：`FileScenePropertiesSection` 往里填自己那一半。 */
const controls: FileSceneControls = {};
provide(FILE_SCENE_CONTROLS_KEY, controls);

const pick = (...ids: string[]) =>
	ids.map((id) => toControl(controls[id] ?? null)).filter((control) => control != null);

const { bindInput, bindSliders } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.fileScene;
	if (!editor) return;
	const bridgeApi: FileScenePageApi = { sync };
	provideFileScenePage(bridgeApi);
	onUnmounted(() => resetFileScenePage(bridgeApi));
	const owner = editor.owner;
	// section 挂载时填表；这里只按 id 取实例（不再走注册表）
	const elements = pick(
		'fileScene-tileWidth',
		'fileScene-tileHeight',
		'fileScene-ambient-red',
		'fileScene-ambient-green',
		'fileScene-ambient-blue',
		'fileScene-ambient-direct'
	);
	const sliders = pick(
		'fileScene-ambient-red-slider',
		'fileScene-ambient-green-slider',
		'fileScene-ambient-blue-slider',
		'fileScene-ambient-direct-slider'
	);
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
