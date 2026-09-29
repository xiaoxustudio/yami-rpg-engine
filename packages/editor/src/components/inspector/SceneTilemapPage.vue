<template>
	<SceneTilemapPropertiesSection />
	<SceneTilemapMetaSection />
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { registryElements } from '@app/utils/element-registry';
import { useSceneTilemapPage } from '@app/composables/useSceneTilemapPage';
import { useInspectorInput } from '@app/composables/useInspectorInput';
import { Inspector } from '@app/inspector/inspector.ts';
import { Scene } from '@app/scene/scene-window.ts';
import { attachElementApi } from '@app/utils/attach-element-api';
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
	const el = inspectorEls.get('sceneTilemap-vue-mount');
	if (el) {
		attachElementApi(el, { sync });
	}
	const elements = registryElements(inspectorEls, [
		'sceneTilemap-name',
		'sceneTilemap-layer',
		'sceneTilemap-order',
		'sceneTilemap-light',
		'sceneTilemap-blend',
		'sceneTilemap-x',
		'sceneTilemap-y',
		'sceneTilemap-anchorX',
		'sceneTilemap-anchorY',
		'sceneTilemap-offsetX',
		'sceneTilemap-offsetY',
		'sceneTilemap-parallaxFactorX',
		'sceneTilemap-parallaxFactorY',
		'sceneTilemap-opacity'
	]);
	bindInput(elements, editor, Scene);

	sync();
});
</script>
