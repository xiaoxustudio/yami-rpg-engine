<template>
	<div class="box" id="title" @pointerenter="onTitlePointerenter">
		<div class="box" id="menu">
			<div class="item menu-item" id="menu-file" value="file">File</div>
			<div class="item menu-item" id="menu-edit" value="edit">Edit</div>
			<div class="item menu-item" id="menu-view" value="view">View</div>
			<div class="item menu-item" id="menu-window" value="window">Window</div>
			<div class="item menu-item" id="menu-help" value="help">Help</div>
			<div class="item menu-item" id="menu-open-yami" value="openYami">Open Yami</div>
		</div>
		<TabBar
			id="title-tabBar"
			@select="onTabBarSelect"
			@closed="onTabBarClosed"
			@popup="onTabBarPopup"
		/>
		<div class="box" id="title-buttons">
			<div
				class="box"
				id="title-play"
				hotkey="F4"
				:class="{ selected: title.playing }"
				@click="onPlayClick"
			>&#xf04b;</div>
			<div class="minimize" id="title-minimize" @click="onMinimizeClick"></div>
			<div class="maximize" id="title-maximize" @click="onMaximizeClick"></div>
			<div class="close" id="title-close" @click="onCloseClick"></div>
		</div>
	</div>
	<LayoutPanel />
	<Teleport to="#project-browser">
		<FileBrowser />
	</Teleport>
	<Teleport v-for="p in inspectorPages" :key="p.value" :to="p.target">
		<component :is="p.comp" @vue:mounted="onComponentMounted" />
	</Teleport>
	<Teleport to="body">
		<component
			:is="comp"
			v-for="(comp, name) in toolComponents"
			:key="name"
			@vue:mounted="onComponentMounted"
		/>
	</Teleport>
	<Teleport to="body">
		<component
			:is="comp"
			v-for="(comp, name) in commandComponents"
			:key="name"
			@vue:mounted="onComponentMounted"
		/>
	</Teleport>
</template>

<script setup lang="ts">
import TabBar from './components/common/TabBar.vue';
import FileBrowser from './components/file-browser/FileBrowser.vue';
import LayoutPanel from './components/layout/LayoutPanel.vue';
import { defineAsyncComponent } from 'vue';
import { useTitleStore } from '@app/stores/title';

const title = useTitleStore();

const onPlayClick = () => {
	(window as any).Title?.playGame?.();
};
const onMinimizeClick = () => {
	(window as any).Title?.minimizeClick?.();
};
const onMaximizeClick = () => {
	(window as any).Title?.maximizeClick?.();
};
const onCloseClick = () => {
	(window as any).Title?.closeClick?.();
};
const onTitlePointerenter = () => {
	(window as any).Title?.pointerenter?.();
};
const onTabBarSelect = (event: any) => {
	(window as any).Title?.tabBarSelect?.(event);
};
const onTabBarClosed = (event: any) => {
	(window as any).Title?.tabBarClosed?.(event);
};
const onTabBarPopup = (event: any) => {
	(window as any).Title?.tabBarPopup?.(event);
};

const toolModules = import.meta.glob('./components/tools/*.vue');
const commandModules = import.meta.glob('./components/commands/*.vue');
const inspectorModules = import.meta.glob('./components/inspector/*.vue');

// 业务初始化（CommandSchema.initAll 等）需要所有弹窗组件的 DOM 已挂载，
// 懒加载组件就绪前先阻塞 Editor.initialize，避免读取到 null DOM
const lazyTotal =
	Object.keys(toolModules).length + Object.keys(commandModules).length + Object.keys(inspectorModules).length;
let lazyMounted = 0;
let resolveLazyReady: (() => void) | undefined;
const lazyComponentsReady = new Promise<void>((resolve) => {
	resolveLazyReady = resolve;
});
const onComponentMounted = () => {
	lazyMounted++;
	if (lazyMounted >= lazyTotal) {
		resolveLazyReady?.();
	}
};
const onAsyncError = (error: any, retry: any, fail: any, attempts: number) => {
	if (attempts < 3) {
		retry();
		return;
	}
	onComponentMounted();
	fail();
};
const asyncComp = (loader: any) => defineAsyncComponent({ loader, onError: onAsyncError });
const toolComponents = Object.fromEntries(
	Object.entries(toolModules).map(([path, loader]) => [path, asyncComp(loader as any)])
);
const commandComponents = Object.fromEntries(
	Object.entries(commandModules).map(([path, loader]) => [path, asyncComp(loader as any)])
);
const inspectorSpecialTargets = new Set(['fileImage', 'fileFont', 'fileScript', 'fileAudio', 'fileVideo', 'fileTileset']);
const inspectorPages = Object.entries(inspectorModules).map(([path, loader]) => {
	const name = path.split('/').pop()!.replace(/\.vue$/, '').replace(/Page$/, '');
	const raw = name.replace(/^UI(?=[A-Z])/, 'ui');
	const value = raw.charAt(0).toLowerCase() + raw.slice(1);
	const target = inspectorSpecialTargets.has(value) ? `#${value}` : `#${value}-vue-mount`;
	return {
		value,
		target,
		comp: asyncComp(loader as any)
	};
});
(window as any).__lazyComponentsReady__ = lazyComponentsReady;
</script>
