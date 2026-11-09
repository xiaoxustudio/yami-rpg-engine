<template>
	<SceneTilemapPropertiesSection />
	<SceneTilemapMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide, onUnmounted } from 'vue';
import { sceneTilemapPageNodes } from '@app/composables/inspector-page-nodes';
import { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { inspectorPageSync, type PageSyncApi } from '@app/composables/inspector-page-sync';
import { sceneTilemapContextKey } from './scene-tilemap/context.ts';
import SceneTilemapPropertiesSection from './scene-tilemap/SceneTilemapPropertiesSection.vue';
import SceneTilemapMetaSection from './scene-tilemap/SceneTilemapMetaSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useSceneTilemapPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(sceneTilemapContextKey, { form, onParamInput });

const { bindInput } = useInspectorInput();

onMounted(() => {
	const editor = Inspector.sceneTilemap;
	if (!editor) return;
	const bridgeApi: PageSyncApi = { sync };
	inspectorPageSync.sceneTilemap.provide(bridgeApi);
	onUnmounted(() => inspectorPageSync.sceneTilemap.reset(bridgeApi));
	const elements = [
		sceneTilemapPageNodes.pick('name'),
		sceneTilemapPageNodes.pick('layer'),
		sceneTilemapPageNodes.pick('order'),
		sceneTilemapPageNodes.pick('light'),
		sceneTilemapPageNodes.pick('blend'),
		sceneTilemapPageNodes.pick('x'),
		sceneTilemapPageNodes.pick('y'),
		sceneTilemapPageNodes.pick('anchorX'),
		sceneTilemapPageNodes.pick('anchorY'),
		sceneTilemapPageNodes.pick('offsetX'),
		sceneTilemapPageNodes.pick('offsetY'),
		sceneTilemapPageNodes.pick('parallaxFactorX'),
		sceneTilemapPageNodes.pick('parallaxFactorY'),
		sceneTilemapPageNodes.pick('opacity')
	].filter((el): el is HTMLElement => el != null);
	bindInput(elements, editor, Scene);

	sync();
});
</script>
