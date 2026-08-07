import { defineStore } from 'pinia';
import { PluginManager } from '@/plugin/plugin.ts';
import { shallowRef } from 'vue';

export const usePluginStore = defineStore('plugin', () => {
	const plugins = shallowRef<any[] | Record<string, any>>([]);

	function syncState() {
		plugins.value = PluginManager?.plugins ?? [];
	}

	function load() {
		PluginManager?.load?.();
	}

	function reload() {
		PluginManager?.reload?.();
	}

	function initialize() {
		PluginManager?.initialize?.();
	}

	function open() {
		PluginManager?.open?.();
	}

	function unload() {
		PluginManager?.unload?.();
	}

	function loadOverview() {
		PluginManager?.loadOverview?.();
	}

	function createOverview(...args: any[]) {
		return PluginManager?.createOverview?.(...args);
	}

	function createData(...args: any[]) {
		return PluginManager?.createData?.(...args);
	}

	function getItemById(...args: any[]) {
		return PluginManager?.getItemById?.(...args);
	}

	function switchOverviewMode() {
		PluginManager?.switchOverviewMode?.();
	}

	function parseMeta(...args: any[]) {
		return PluginManager?.parseMeta?.(...args);
	}

	function reconstruct(...args: any[]) {
		return PluginManager?.reconstruct?.(...args);
	}

	function saveToProject(...args: any[]) {
		PluginManager?.saveToProject?.(...args);
	}

	function loadFromProject(...args: any[]) {
		PluginManager?.loadFromProject?.(...args);
	}

	function windowClose(...args: any[]) {
		PluginManager?.windowClose?.(...args);
	}

	function windowClosed(...args: any[]) {
		PluginManager?.windowClosed?.(...args);
	}

	function keydown(...args: any[]) {
		PluginManager?.keydown?.(...args);
	}

	function pointerdown(...args: any[]) {
		PluginManager?.pointerdown?.(...args);
	}

	function scriptChange(...args: any[]) {
		PluginManager?.scriptChange?.(...args);
	}

	function listKeydown(...args: any[]) {
		PluginManager?.listKeydown?.(...args);
	}

	function listSelect(...args: any[]) {
		PluginManager?.listSelect?.(...args);
	}

	function listUnselect(...args: any[]) {
		PluginManager?.listUnselect?.(...args);
	}

	function listChange(...args: any[]) {
		PluginManager?.listChange?.(...args);
	}

	function listPopup(...args: any[]) {
		PluginManager?.listPopup?.(...args);
	}

	function listOpen(...args: any[]) {
		PluginManager?.listOpen?.(...args);
	}

	function overviewPointerdown(...args: any[]) {
		PluginManager?.overviewPointerdown?.(...args);
	}

	function parameterPaneUpdate(...args: any[]) {
		PluginManager?.parameterPaneUpdate?.(...args);
	}

	function confirm(...args: any[]) {
		PluginManager?.confirm?.(...args);
	}

	function apply(...args: any[]) {
		PluginManager?.apply?.(...args);
	}

	function checkValidate(...args: any[]) {
		return PluginManager?.checkValidate?.(...args);
	}

	return {
		plugins,
		syncState,
		load,
		reload,
		initialize,
		open,
		unload,
		loadOverview,
		createOverview,
		createData,
		getItemById,
		switchOverviewMode,
		parseMeta,
		reconstruct,
		saveToProject,
		loadFromProject,
		windowClose,
		windowClosed,
		keydown,
		pointerdown,
		scriptChange,
		listKeydown,
		listSelect,
		listUnselect,
		listChange,
		listPopup,
		listOpen,
		overviewPointerdown,
		parameterPaneUpdate,
		confirm,
		apply,
		checkValidate
	};
});
