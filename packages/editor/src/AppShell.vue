<template>
	<div
		class="box"
		id="title"
		:ref="registryRef(windowShellEls, 'title')"
		@pointerenter="onTitlePointerenter"
	>
		<div
			class="box"
			id="menu"
			:class="{ visible: local.ready }"
			@pointerdown="onMenuPointerdown"
			@pointerup="onMenuPointerup"
			@pointerover="onMenuPointerover"
		>
			<div class="item menu-item" id="menu-file" value="file">
				{{ t('components.menu-file.content') }}
			</div>
			<div class="item menu-item" id="menu-edit" value="edit">
				{{ t('components.menu-edit.content') }}
			</div>
			<div class="item menu-item" id="menu-view" value="view">
				{{ t('components.menu-view.content') }}
			</div>
			<div class="item menu-item" id="menu-window" value="window">
				{{ t('components.menu-window.content') }}
			</div>
			<div class="item menu-item" id="menu-help" value="help">
				{{ t('components.menu-help.content') }}
			</div>
			<div class="item menu-item" id="menu-open-yami" value="openYami">
				{{ t('components.menu-open-yami.content') }}
			</div>
		</div>
		<TabBar
			id="title-tabBar"
			:ref="registryRef(titleEls, 'title-tabBar')"
			@select="onTabBarSelect"
			@closed="onTabBarClosed"
			@popup="onTabBarPopup"
		/>
		<div class="box" id="title-buttons">
			<div
				class="box"
				id="title-play"
				v-tip="t('components.title-play.tip')"
				:ref="registryRef(titleEls, 'title-play')"
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
		<div id="title-app-region" :ref="registryRef(titleEls, 'title-app-region')" />
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
			@vue:mounted="onCriticalMounted"
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
				@vue:mounted="onToolMounted"
			/>
		</Teleport>
		<Teleport to="body">
			<component
				:is="comp"
				v-for="(comp, name) in commandComponents"
				:key="name"
				@vue:mounted="onCommandMounted"
			/>
		</Teleport>
		<Teleport v-for="p in inspectorPageComponents" :key="p.value" :to="p.target">
			<component :is="p.comp" @vue:mounted="onInspectorMounted" />
		</Teleport>
	</template>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import TabBar from './components/common/TabBar.vue';
import { titleEls } from '@app/title/element-registry';
import { windowShellEls } from '@app/tools/window-object.ts';
import { registryRef } from '@app/utils/element-registry';
import FileBrowser from './components/file-browser/FileBrowser.vue';
import SearchHistoryDropdown from './components/file-browser/SearchHistoryDropdown.vue';
import LayoutPanel from './components/layout/LayoutPanel.vue';
import CommandSuggestions from './components/tools/CommandSuggestions.vue';
import LogMessage from './components/tools/LogMessage.vue';
import TextSuggestions from './components/tools/TextSuggestions.vue';
import Confirmation from './components/tools/Confirmation.vue';
import NewProject from './components/tools/NewProject.vue';
import About from './components/tools/About.vue';
import WindowProgress from './components/tools/WindowProgress.vue';
import UpdateLog from './components/tools/UpdateLog.vue';
import Setting from './components/tools/Setting.vue';
import Deployment from './components/tools/Deployment.vue';
import CommandWidget from './components/tools/CommandWidget.vue';
import QrCode from './components/tools/QrCode.vue';
import { defineAsyncComponent, getCurrentInstance, ref } from 'vue';
import type { Component } from 'vue';
import { preloadToolWindows, setToolWindowHostContext } from '@app/tools/tool-window-host';
import { useTitleStore } from '@app/stores/title';
import { useMenubarStore } from '@app/stores/menubar';
import { useLocalStore } from '@app/stores/local';
import {
	resolveCriticalComponentsReady,
	resolveLazyComponentsReady,
	workspaceActivation
} from '@app/bootstrap';
import { markBoot } from '@app/utils/boot-timeline';
import { showBootProgress } from '@app/main/boot-progress';
import { provideMenuService } from '@app/composables/useMenuService';
import { Menu } from '@app/components/menu-list';
import { inspectorPages, inspectorPageCount } from '@app/components/inspector/inspector-pages';

const { t } = useI18n();

const instance = getCurrentInstance();
if (instance) setToolWindowHostContext(instance.appContext);

provideMenuService({ getState: () => Menu.state });

const title = useTitleStore();
const menubar = useMenubarStore();
const local = useLocalStore();

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
	'!**/TextSuggestions.vue',
	'!**/Confirmation.vue',
	'!**/NewProject.vue',
	'!**/About.vue',
	'!**/WindowProgress.vue',
	'!**/UpdateLog.vue',
	'!**/Setting.vue',
	'!**/Deployment.vue',
	'!**/CommandWidget.vue',
	'!**/QrCode.vue'
]);
const commandModules = import.meta.glob('./components/commands/*.vue');

const toolWindowEntries = Object.entries(toolModules).filter(
	([path]) =>
		!path.endsWith('PluginOverview.vue') &&
		!path.endsWith('CommandSuggestions.vue') &&
		!path.endsWith('LogMessage.vue') &&
		!path.endsWith('TextSuggestions.vue')
);

const deferredToolFiles = new Set([
	'MoveElementProperty.vue',
	'MoveLightProperty.vue',
	'SetAnimationProperty.vue',
	'SetButtonProperty.vue',
	'SetDialogBoxProperty.vue',
	'SetImageProperty.vue',
	'SetProgressBarProperty.vue',
	'SetTextProperty.vue',
	'SetTextBoxProperty.vue',
	'SetVideoProperty.vue',
	'SetWindowProperty.vue',
	'SetNumberOperand.vue',
	'IfBranch.vue',
	'IfCondition.vue',
	'SwitchBranch.vue',
	'SwitchCondition.vue',
	'EventSearchString.vue',
	'ObjectPropertyIndex.vue',
	'ActorGetter.vue',
	'AncestorGetter.vue',
	'AngleGetter.vue',
	'ElementGetter.vue',
	'EquipmentGetter.vue',
	'ItemGetter.vue',
	'LightGetter.vue',
	'ObjectGetter.vue',
	'PositionGetter.vue',
	'RegionGetter.vue',
	'SkillGetter.vue',
	'StateGetter.vue',
	'TilemapGetter.vue',
	'TriggerGetter.vue',
	'VariableGetter.vue',
	'VariableGetter2.vue',
	'ExportApk.vue',
	'Resource.vue',
	'SceneShift.vue',
	'ObjectFolder.vue',
	'EditData.vue',
	'LocalVariable.vue',
	'Language.vue',
	'ImportLanguage.vue',
	'ExportLanguage.vue',
	'InsertImage.vue',
	'CopyProgress.vue',
	'Choice.vue',
	'ScriptCommand.vue',
	'Condition.vue',
	'Zoom.vue',
	'Rename.vue',
	'SetKey.vue',
	'RequestKeyValue.vue',
	'ArrayListNumber.vue',
	'ArrayListString.vue'
]);
const deferredToolIds = [
	'moveElement-property',
	'moveLight-property',
	'setAnimation-property',
	'setButton-property',
	'setDialogBox-property',
	'setImage-property',
	'setProgressBar-property',
	'setText-property',
	'setTextBox-property',
	'setVideo-property',
	'setWindow-property',
	'setNumber-operand',
	'if-branch',
	'if-condition',
	'switch-branch',
	'switch-condition',
	'event-search-string',
	'ObjectProperty-index',
	'actorGetter',
	'ancestorGetter',
	'angleGetter',
	'elementGetter',
	'equipmentGetter',
	'itemGetter',
	'lightGetter',
	'objectGetter',
	'positionGetter',
	'regionGetter',
	'skillGetter',
	'stateGetter',
	'tilemapGetter',
	'triggerGetter',
	'variableGetter',
	'variableGetter2',
	'export-apk',
	'resource',
	'scene-shift',
	'object-folder',
	'edit-data',
	'localVariable',
	'language',
	'importLanguage',
	'exportLanguage',
	'insertImage',
	'copyProgress',
	'choice',
	'scriptCommand',
	'condition',
	'zoom',
	'rename',
	'setKey',
	'request-keyValue',
	'arrayList-number',
	'arrayList-string'
];
const eagerToolEntries = toolWindowEntries.filter(
	([path]) => !deferredToolFiles.has(path.split('/').pop()!)
);
void workspaceActivation.then(() => preloadToolWindows(deferredToolIds));

const toolTotal = eagerToolEntries.length;
const commandTotal = Object.keys(commandModules).length;
const inspectorTotal = inspectorPageCount;
const lazyTotal = toolTotal + commandTotal + inspectorTotal;
let toolMounted = 0;
let commandMounted = 0;
let inspectorMounted = 0;
const reportLazyProgress = () => {
	showBootProgress(
		'正在加载核心组件…',
		toolMounted + commandMounted + inspectorMounted,
		lazyTotal
	);
};
void workspaceActivation.then(reportLazyProgress);
const maybeLazyReady = () => {
	reportLazyProgress();
	if (
		toolMounted >= toolTotal &&
		commandMounted >= commandTotal &&
		inspectorMounted >= inspectorTotal
	) {
		resolveLazyComponentsReady();
	}
};
const onToolMounted = () => {
	toolMounted++;
	if (toolMounted >= toolTotal) markBoot('tools-ready');
	maybeLazyReady();
};
const onCommandMounted = () => {
	commandMounted++;
	if (commandMounted >= commandTotal) markBoot('commands-ready');
	maybeLazyReady();
};
const onInspectorMounted = () => {
	inspectorMounted++;
	if (inspectorMounted >= inspectorTotal) markBoot('inspectors-ready');
	maybeLazyReady();
};
const onAsyncError =
	(fallback: () => void) =>
	(_error: Error, retry: () => void, fail: () => void, attempts: number) => {
		if (attempts < 3) {
			retry();
			return;
		}
		fallback();
		fail();
	};
const asyncComp = (loader: () => Promise<Component>, fallback: () => void) =>
	defineAsyncComponent({ loader, onError: onAsyncError(fallback) });
const immediateToolComponents = {
	Confirmation,
	NewProject,
	About,
	WindowProgress,
	UpdateLog,
	Setting,
	Deployment,
	CommandWidget,
	QrCode
};
const criticalTotal = Object.keys(immediateToolComponents).length;
let criticalMounted = 0;
const onCriticalMounted = () => {
	criticalMounted++;
	if (criticalMounted >= criticalTotal) {
		resolveCriticalComponentsReady();
	}
};
const idleToolComponents = Object.fromEntries(
	eagerToolEntries.map(([path, loader]) => [
		path,
		asyncComp(loader as () => Promise<Component>, onToolMounted)
	])
);
const idleReady = ref(false);
void workspaceActivation.then(() => {
	idleReady.value = true;
});
const commandComponents = Object.fromEntries(
	Object.entries(commandModules).map(([path, loader]) => [
		path,
		asyncComp(loader as () => Promise<Component>, onCommandMounted)
	])
);
const inspectorPageComponents = inspectorPages.map(({ value, target, loader }) => ({
	value,
	target,
	comp: asyncComp(loader as () => Promise<Component>, onInspectorMounted)
}));
</script>

<style>
#title {
	display: flex;
	position: absolute;
	width: 100%;
	height: 28px;
	justify-content: flex-end;
	background-color: var(--title-background);
	overflow: hidden;
}

#menu {
	flex: 0 1 320px;
	display: flex;
	height: 28px;
	line-height: 28px;
	overflow: hidden;
	visibility: hidden;
}

#title-buttons {
	flex: 0 1 320px;
	display: flex;
	height: 28px;
	justify-content: flex-end;
}

#title-play {
	width: 44px;
	height: 28px;
	line-height: 28px;
	text-align: center;

	font-family: var(--font-family-symbol);
}

#title-play,
#title-minimize,
#title-maximize,
#title-close {
	position: static;
	right: auto;
	-webkit-app-region: no-drag;
}
</style>
