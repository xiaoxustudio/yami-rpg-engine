<template>
	<div class="box" id="title" @pointerenter="onTitlePointerenter">
		<div
			class="box"
			id="menu"
			@pointerdown="onMenuPointerdown"
			@pointerup="onMenuPointerup"
			@pointerover="onMenuPointerover"
		>
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
			>
				&#xf04b;
			</div>
			<div class="minimize" id="title-minimize" @click="onMinimizeClick"></div>
			<div class="maximize" id="title-maximize" @click="onMaximizeClick"></div>
			<div class="close" id="title-close" @click="onCloseClick"></div>
		</div>
		<div id="title-app-region" />
	</div>
	<LayoutPanel />
	<Teleport to="#project-browser">
		<FileBrowser />
	</Teleport>
	<SearchHistoryDropdown />
	<Teleport to="body">
		<component
			:is="comp"
			v-for="(comp, name) in immediateToolComponents"
			:key="name"
			@vue:mounted="onComponentMounted"
		/>
		<CommandSuggestions />
		<LogMessage />
		<TextSuggestions />
	</Teleport>
	<template v-if="idleReady">
		<Teleport to="body">
			<component
				:is="comp"
				v-for="(comp, name) in idleToolComponents"
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
		<Teleport v-for="p in inspectorPages" :key="p.value" :to="p.target">
			<component :is="p.comp" @vue:mounted="onComponentMounted" />
		</Teleport>
	</template>
</template>

<script setup lang="ts">
import TabBar from './components/common/TabBar.vue';
import FileBrowser from './components/file-browser/FileBrowser.vue';
import SearchHistoryDropdown from './components/file-browser/SearchHistoryDropdown.vue';
import LayoutPanel from './components/layout/LayoutPanel.vue';
import CommandSuggestions from './components/tools/CommandSuggestions.vue';
import LogMessage from './components/tools/LogMessage.vue';
import TextSuggestions from './components/tools/TextSuggestions.vue';
import { defineAsyncComponent, onMounted, ref } from 'vue';
import type { Component } from 'vue';
import { useTitleStore } from '@app/stores/title';
import { useMenubarStore } from '@app/stores/menubar';
import { resolveLazyComponentsReady } from '@app/bootstrap';
import { provideMenuService } from '@app/composables/useMenuService';
import { Menu } from '@app/components/menu-list';

provideMenuService({ getState: () => Menu.state });

const title = useTitleStore();
const menubar = useMenubarStore();

const onPlayClick = () => {
	title.playGame();
};
const onMinimizeClick = () => {
	title.minimizeClick();
};
const onMaximizeClick = () => {
	title.maximizeClick();
};
const onCloseClick = () => {
	title.closeClick();
};
const onTitlePointerenter = () => {
	title.pointerenter();
};
const onTabBarSelect = (event: Event) => {
	title.tabBarSelect(event);
};
const onTabBarClosed = (event: Event) => {
	title.tabBarClosed(event);
};
const onTabBarPopup = (event: Event) => {
	title.tabBarPopup(event);
};
const onMenuPointerdown = (event: PointerEvent) => {
	menubar.pointerdown(event);
};
const onMenuPointerup = (event: PointerEvent) => {
	menubar.pointerup(event);
};
const onMenuPointerover = (event: PointerEvent) => {
	menubar.pointerover(event);
};

const toolModules = import.meta.glob([
	'./components/tools/*.vue',
	'!**/CommandSuggestions.vue',
	'!**/LogMessage.vue',
	'!**/TextSuggestions.vue'
]);
const commandModules = import.meta.glob('./components/commands/*.vue');
const inspectorModules = import.meta.glob('./components/inspector/*.vue');

// PluginOverview 为窗口内子组件（Plugin/Command/FileScriptPage 使用），不作为独立窗口挂载
const toolWindowEntries = Object.entries(toolModules).filter(
	([path]) =>
		!path.endsWith('PluginOverview.vue') &&
		!path.endsWith('CommandSuggestions.vue') &&
		!path.endsWith('LogMessage.vue') &&
		!path.endsWith('TextSuggestions.vue')
);

// 业务初始化（CommandSchema.initAll 等）需要所有弹窗组件的 DOM 已挂载，
// 懒加载组件就绪前先阻塞 Editor.initialize，避免读取到 null DOM
const lazyTotal =
	toolWindowEntries.length +
	Object.keys(commandModules).length +
	Object.keys(inspectorModules).length;
let lazyMounted = 0;
const onComponentMounted = () => {
	lazyMounted++;
	if (lazyMounted >= lazyTotal) {
		resolveLazyComponentsReady();
	}
};
const onAsyncError = (_error: Error, retry: () => void, fail: () => void, attempts: number) => {
	if (attempts < 3) {
		retry();
		return;
	}
	onComponentMounted();
	fail();
};
const asyncComp = (loader: () => Promise<Component>) =>
	defineAsyncComponent({ loader, onError: onAsyncError });
const criticalToolNames = new Set([
	'Confirmation.vue',
	'NewProject.vue',
	'About.vue',
	'WindowProgress.vue',
	'UpdateLog.vue',
	'Setting.vue',
	'Deployment.vue',
	'CommandWidget.vue',
	'QrCode.vue'
]);
const criticalToolEntries = toolWindowEntries.filter(([path]) =>
	criticalToolNames.has(path.split('/').pop()!)
);
const idleToolEntries = toolWindowEntries.filter(
	([path]) => !criticalToolNames.has(path.split('/').pop()!)
);
const immediateToolComponents = Object.fromEntries(
	criticalToolEntries.map(([path, loader]) => [
		path,
		asyncComp(loader as unknown as () => Promise<Component>)
	])
);
const idleToolComponents = Object.fromEntries(
	idleToolEntries.map(([path, loader]) => [
		path,
		asyncComp(loader as unknown as () => Promise<Component>)
	])
);
// 非关键弹窗（其余工具/命令/检查器）延后到浏览器空闲时挂载，避免首屏并行拉取全部异步组件
const idleReady = ref(false);
onMounted(() => {
	const activateIdle = () => {
		idleReady.value = true;
	};
	if (typeof requestIdleCallback === 'function') {
		requestIdleCallback(() => activateIdle(), { timeout: 3000 });
	} else {
		setTimeout(activateIdle, 500);
	}
});
const commandComponents = Object.fromEntries(
	Object.entries(commandModules).map(([path, loader]) => [
		path,
		asyncComp(loader as unknown as () => Promise<Component>)
	])
);
const inspectorSpecialTargets = new Set([
	'fileImage',
	'fileFont',
	'fileScript',
	'fileAudio',
	'fileVideo',
	'fileTileset'
]);
const inspectorPages = Object.entries(inspectorModules).map(([path, loader]) => {
	const name = path
		.split('/')
		.pop()!
		.replace(/\.vue$/, '')
		.replace(/Page$/, '');
	const raw = name.replace(/^UI(?=[A-Z])/, 'ui');
	const value = raw.charAt(0).toLowerCase() + raw.slice(1);
	const target = inspectorSpecialTargets.has(value) ? `#${value}` : `#${value}-vue-mount`;
	return {
		value,
		target,
		comp: asyncComp(loader as unknown as () => Promise<Component>)
	};
});
</script>
