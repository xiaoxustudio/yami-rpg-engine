<template>
	<PageManager
		id="workspace-page-manager"
		:ref="registryRef(engineEls, 'workspace-page-manager')"
	>
		<HomePanel />
		<div class="page-frame" value="directory">
			<div class="box" id="layout-content">
				<LayoutPaletteHost>
					<WorkspaceNav ref="paletteNavEl" />
					<WorkspacePages ref="paletteManagerEl" />
				</LayoutPaletteHost>
			</div>
		</div>
		<div class="page-frame" value="scene"></div>
		<div class="page-frame" value="ui"></div>
		<div class="page-frame" value="animation"></div>
		<div class="page-frame" value="particle"></div>
	</PageManager>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref } from 'vue';
import { engineEls } from '@app/engine/element-registry';
import { registerElement, registryRef } from '@app/utils/element-registry';
import PageManager from '@app/components/common/PageManager.vue';
import LayoutPaletteHost from '@app/components/layout/LayoutPaletteHost.vue';
import HomePanel from '@app/components/layout/HomePanel.vue';
import WorkspaceNav from '@app/components/layout/WorkspaceNav.vue';
import WorkspacePages from '@app/components/layout/WorkspacePages.vue';
import { getUIStore } from '@app/stores/ui';
import { getSceneStore } from '@app/stores/scene';
import { getParticleStore } from '@app/stores/particle';
import { getAnimationStore } from '@app/stores/animation';
import { registerLayoutItems } from '@app/engine/layout/layout.ts';
import { collectPaletteItems } from '@app/components/layout/palette-items';

const paletteNavEl = ref<InstanceType<typeof WorkspaceNav> | null>(null);
const paletteManagerEl = ref<InstanceType<typeof WorkspacePages> | null>(null);

onMounted(() => {
	registerElement(engineEls, 'layout-nav', paletteNavEl.value);
	registerElement(engineEls, 'layout-page-manager', paletteManagerEl.value);
	nextTick(() => {
		getUIStore().initialize();
		getParticleStore().initialize();
		getSceneStore().initialize();
		getAnimationStore().initialize();
		registerLayoutItems(collectPaletteItems(paletteNavEl.value, paletteManagerEl.value));
	});
});
</script>

<style>
#project-browser {
	width: 100%;
	height: 100%;
}

#scene,
#ui,
#animation,
#particle {
	position: absolute;
	width: 100%;
	height: 100%;
	background-color: var(--stage-page-background);
}

#scene-head {
	display: flex;
	position: absolute;
	flex: 1 0 auto;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#scene-head-start {
	display: flex;
	flex: 0 0 auto;
	width: 115px;
}

#scene-head-center {
	display: flex;
	flex: 0 0 auto;

	border-left: var(--toolbar-item-border);
}

#scene-layer,
#scene-brush {
	display: flex;
}

#scene-head-end {
	flex: 0 0 auto;
}

#scene-zoom {
	margin: 2px 4px;
	right: 0;
	width: 80px;
}

#scene-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#scene-info {
	position: absolute;
	padding: 0 4px;
	line-height: 20px;
	color: white;
	overflow: hidden;
	white-space: pre;
	text-overflow: ellipsis;
	text-shadow: var(--stage-info-text-shadow);
	pointer-events: none;
}

#scene-list-head {
	position: absolute;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#scene-searcher {
	margin: 2px;
	width: calc(100% - 4px);
}

#scene-list {
	position: absolute;
	width: 100%;
	height: 100%;
}

#ui-head {
	display: flex;
	position: absolute;
	flex: 1 0 auto;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#ui-head-start {
	display: flex;
	flex: 0 0 auto;
	width: 28px;
}

#ui-head-center {
	display: flex;
	flex: 0 0 auto;

	border-left: var(--toolbar-item-border);
}

#ui-head-end {
	flex: 0 0 auto;
}

#ui-zoom {
	margin: 2px 4px;
	right: 0;
	width: 80px;
}

#ui-screen {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

#ui-list-head {
	position: absolute;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#ui-searcher {
	margin: 2px;
	width: calc(100% - 4px);
}

#ui-list {
	position: absolute;
	width: 100%;
	height: 100%;
}

#scene-object,
#ui-element,
#animation-motion {
	position: absolute;
	width: 100%;
	height: 100%;
}

#inspector-page-manager {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow-x: hidden;
	overflow-y: auto;
}

#project-confirm {
	right: 108px;
	bottom: 10px;
}

#project-cancel {
	right: 10px;
	bottom: 10px;
}

#fileImage {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

#fileVideo {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

#fileTileset {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

#layout-content {
	display: none;
}

#workspace-page-manager {
	position: absolute;
	left: 0;
	top: 28px;
	right: 0;
	bottom: 0;

	height: auto;
	overflow: hidden;
	border-top: var(--nav-bar-border);
}

#home-content {
	display: block;
	position: absolute;

	margin-left: -40px;
	margin-top: 20px;
	left: 100px;
	top: 100px;
	width: 636px;
	height: 522px;
}

#home-version {
	position: absolute;
	margin-top: 40px;
	width: 100%;
	height: 100px;
	font-weight: bold;
	color: var(--home-title-color);
	font-weight: bold;
}

#home-title {
	position: absolute;
	width: 100%;
	height: 100px;
	font-size: 32px;
	font-weight: bold;
	color: var(--home-title-color);
}

#home-start-list {
	display: flex;
	position: absolute;
	flex-direction: column;
	left: 0;
	top: 100px;
	width: 160px;
	height: 422px;
	row-gap: 10px;
}

#animation-easing {
	position: absolute;
	width: 100%;
	height: 100%;
}

#animation-easing-head {
	display: flex;
	position: absolute;
	justify-content: space-between;
	top: -25px;
	right: 0;
	height: 24px;
	overflow: hidden;
	background-color: var(--group-head-background);
}

#animation-easing-id {
	margin: 2px;
	flex: 1 1 auto;
}

#animation-easing-canvas {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}
</style>
