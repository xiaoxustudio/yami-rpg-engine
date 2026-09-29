<template>
	<FileTilesetPaletteSection />
	<FileTilesetGeneralSection />
</template>

<script setup lang="ts">
import '@app/inspector/file-tileset-page.ts';
import { onMounted, provide } from 'vue';
import { inspectorEls } from '@app/inspector/element-registry.ts';
import { useFileTilesetPage } from '@app/composables/useFileTilesetPage';
import { attachElementApi } from '@app/utils/attach-element-api';
import { fileTilesetContextKey } from './file-tileset/context.ts';
import FileTilesetPaletteSection from './file-tileset/FileTilesetPaletteSection.vue';
import FileTilesetGeneralSection from './file-tileset/FileTilesetGeneralSection.vue';

const { form, sync, onParamInput: onParamInputEvent } = useFileTilesetPage();

const onParamInput = (value: unknown): void => {
	onParamInputEvent(value as Event);
};

provide(fileTilesetContextKey, { form, onParamInput });

onMounted(() => {
	const el = inspectorEls.get('fileTileset');
	if (el) {
		attachElementApi(el, { sync });
	}
	sync();
});
</script>

<style>
#palette-head {
	display: flex;
	position: absolute;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#palette-head-start {
	display: flex;
	flex: 0 0 auto;
	/* background-color: green; */
}

#palette-zoom {
	flex: 0 0 auto;
	margin: 2px 4px;
	width: 80px;
	/* background-color: green; */
}

#palette-body {
	flex-grow: 1;
	display: block;
	position: relative;
	width: 100%;
	overflow: hidden;
}

#palette-canvas {
	position: absolute;
	background-image: var(--grid-background);
	background-size: var(--16dpx);
	outline: var(--window-outline);
}

#palette-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#palette-info {
	position: absolute;
	left: 0;
	top: 0;
	padding: 0 4px;
	line-height: 20px;
	color: white;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-shadow: var(--stage-info-text-shadow);
	pointer-events: none;
}
</style>
