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
import type { Component } from 'vue';
import { useTitleStore } from '@app/stores/title';
import { useMenubarStore } from '@app/stores/menubar';
import { resolveLazyComponentsReady } from '@app/bootstrap';
import { provideMenuService } from '@app/composables/useMenuService';
import { Menu } from '@/components/menu-list';

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

const toolModules = import.meta.glob('./components/tools/*.vue');
const commandModules = import.meta.glob('./components/commands/*.vue');
const inspectorModules = import.meta.glob('./components/inspector/*.vue');

// 业务初始化（CommandSchema.initAll 等）需要所有弹窗组件的 DOM 已挂载，
// 懒加载组件就绪前先阻塞 Editor.initialize，避免读取到 null DOM
const lazyTotal =
	Object.keys(toolModules).length + Object.keys(commandModules).length + Object.keys(inspectorModules).length;
let lazyMounted = 0;
const onComponentMounted = () => {
	lazyMounted++;
	if (lazyMounted >= lazyTotal) {
		resolveLazyComponentsReady();
	}
};
const onAsyncError = (error: Error, retry: () => void, fail: () => void, attempts: number) => {
	if (attempts < 3) {
		retry();
		return;
	}
	onComponentMounted();
	fail();
};
const asyncComp = (loader: () => Promise<Component>) => defineAsyncComponent({ loader, onError: onAsyncError });
const toolComponents = Object.fromEntries(
	Object.entries(toolModules).map(([path, loader]) => [path, asyncComp(loader as unknown as () => Promise<Component>)])
);
const commandComponents = Object.fromEntries(
	Object.entries(commandModules).map(([path, loader]) => [path, asyncComp(loader as unknown as () => Promise<Component>)])
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
		comp: asyncComp(loader as unknown as () => Promise<Component>)
	};
});
</script>
