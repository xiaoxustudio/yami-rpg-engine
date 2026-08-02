<template>
	<box id="title">
		<box id="menu">
			<item id="menu-file" class="menu-item" value="file">File</item>
			<item id="menu-edit" class="menu-item" value="edit">Edit</item>
			<item id="menu-view" class="menu-item" value="view">View</item>
			<item id="menu-window" class="menu-item" value="window">Window</item>
			<item id="menu-help" class="menu-item" value="help">Help</item>
			<item id="menu-open-yami" class="menu-item" value="openYami">Open Yami</item>
		</box>
		<TabBar id="title-tabBar" />
		<box id="title-buttons">
			<box id="title-play" hotkey="F4">&#xf04b;</box>
			<minimize id="title-minimize"></minimize>
			<maximize id="title-maximize"></maximize>
			<close id="title-close"></close>
		</box>
	</box>
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
