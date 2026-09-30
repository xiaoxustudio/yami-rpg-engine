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

// palette 容器 ref（显式登记 items 用）
const paletteNavEl = ref<InstanceType<typeof WorkspaceNav> | null>(null);
const paletteManagerEl = ref<InstanceType<typeof WorkspacePages> | null>(null);

onMounted(() => {
	registerElement(engineEls, 'layout-nav', paletteNavEl.value);
	registerElement(engineEls, 'layout-page-manager', paletteManagerEl.value);
	// ⚠️ 四个 store 的 initialize() 只依赖「Vue 已挂载」，与任何单个元素是否存在无关，
	// 因此**不能**挂在某个元素的早退判断之下 —— 否则该元素为 null 时
	// UI/Scene/Animation/Particle 四套引擎全都不初始化，表现为「画面能出来、
	// 列表能点，但画布交互全死」这种极难定位的半死状态。
	nextTick(() => {
		getUIStore().initialize();
		getParticleStore().initialize();
		getSceneStore().initialize();
		getAnimationStore().initialize();
		// palette 显式登记（此时 palette 节点仍在 palette 宿主内，
		// 引擎装载前即可拿到权威 items 列表，无需按 DOM 形态猜测）。
		// 容器 ref 指向组件（NavBar/PageManager）→ 经 $el 取根元素后遍历子节点。
		registerLayoutItems(collectPaletteItems(paletteNavEl.value, paletteManagerEl.value));
	});
});
</script>

<style>
/* 不能用 scoped：-confirm/-cancel 等元素由 WindowFrame 内部生成 */
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
	/* background: yellow; */
}

#scene-head-center {
	display: flex;
	flex: 0 0 auto;
	/* background: green; */
	border-left: var(--toolbar-item-border);
}

#scene-layer,
#scene-brush {
	display: flex;
}

#scene-head-end {
	flex: 0 0 auto;
	/* background: blue; */
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
	/* background: yellow; */
}

#ui-head-center {
	display: flex;
	flex: 0 0 auto;
	/* background: green; */
	border-left: var(--toolbar-item-border);
}

#ui-head-end {
	flex: 0 0 auto;
	/* background: blue; */
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

/* 不能用 scoped：选择器需命中子组件内部生成的元素 */
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
	/* 覆盖 YMPageManager 模块类的 height:100%
	 * 否则 top+height 并存时 bottom:0 失效，高度超出窗口 28px */
	height: auto;
	overflow: hidden;
	border-top: var(--nav-bar-border);
}

#home-content {
	display: block;
	position: absolute;
	/* 稍微调整显示位置 */
	margin-left: -40px;
	margin-top: 20px;
	left: 100px;
	top: 100px;
	width: 636px;
	height: 522px;
	/* background-color: yellow; */
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
	/* background-color: green; */
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
	/* background-color: red; */
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
	/* background: blue; */
}

#animation-easing-canvas {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
}
</style>
