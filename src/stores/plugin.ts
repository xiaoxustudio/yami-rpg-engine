import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const usePluginStore = defineStore('plugin', () => {
	const plugins = shallowRef<any[]>([]);

	function syncState() {
		plugins.value = (window as any).PluginManager?.plugins ?? [];
	}

	function load() {
		(window as any).PluginManager?.load?.();
	}

	function reload() {
		(window as any).PluginManager?.reload?.();
	}

	function initialize() {
		(window as any).PluginManager?.initialize?.();
	}

	function open() {
		(window as any).PluginManager?.open?.();
	}

	function unload() {
		(window as any).PluginManager?.unload?.();
	}

	function loadOverview() {
		(window as any).PluginManager?.loadOverview?.();
	}

	function createOverview(...args: any[]) {
		return (window as any).PluginManager?.createOverview?.(...args);
	}

	function createData(...args: any[]) {
		return (window as any).PluginManager?.createData?.(...args);
	}

	function getItemById(...args: any[]) {
		return (window as any).PluginManager?.getItemById?.(...args);
	}

	function switchOverviewMode() {
		(window as any).PluginManager?.switchOverviewMode?.();
	}

	function parseMeta(...args: any[]) {
		return (window as any).PluginManager?.parseMeta?.(...args);
	}

	function reconstruct(...args: any[]) {
		return (window as any).PluginManager?.reconstruct?.(...args);
	}

	function saveToProject(...args: any[]) {
		(window as any).PluginManager?.saveToProject?.(...args);
	}

	function loadFromProject(...args: any[]) {
		(window as any).PluginManager?.loadFromProject?.(...args);
	}

	function windowClose(...args: any[]) {
		(window as any).PluginManager?.windowClose?.(...args);
	}

	function windowClosed(...args: any[]) {
		(window as any).PluginManager?.windowClosed?.(...args);
	}

	function keydown(...args: any[]) {
		(window as any).PluginManager?.keydown?.(...args);
	}

	function pointerdown(...args: any[]) {
		(window as any).PluginManager?.pointerdown?.(...args);
	}

	function scriptChange(...args: any[]) {
		(window as any).PluginManager?.scriptChange?.(...args);
	}

	function listKeydown(...args: any[]) {
		(window as any).PluginManager?.listKeydown?.(...args);
	}

	function listSelect(...args: any[]) {
		(window as any).PluginManager?.listSelect?.(...args);
	}

	function listUnselect(...args: any[]) {
		(window as any).PluginManager?.listUnselect?.(...args);
	}

	function listChange(...args: any[]) {
		(window as any).PluginManager?.listChange?.(...args);
	}

	function listPopup(...args: any[]) {
		(window as any).PluginManager?.listPopup?.(...args);
	}

	function listOpen(...args: any[]) {
		(window as any).PluginManager?.listOpen?.(...args);
	}

	function overviewPointerdown(...args: any[]) {
		(window as any).PluginManager?.overviewPointerdown?.(...args);
	}

	function parameterPaneUpdate(...args: any[]) {
		(window as any).PluginManager?.parameterPaneUpdate?.(...args);
	}

	function confirm(...args: any[]) {
		(window as any).PluginManager?.confirm?.(...args);
	}

	function apply(...args: any[]) {
		(window as any).PluginManager?.apply?.(...args);
	}

	function checkValidate(...args: any[]) {
		return (window as any).PluginManager?.checkValidate?.(...args);
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
