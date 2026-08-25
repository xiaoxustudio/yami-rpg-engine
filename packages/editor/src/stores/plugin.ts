import { defineStore } from 'pinia';
import { PluginManager } from '@app/plugin/plugin.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

// oxlint-disable-next-line no-explicit-any
type PluginItemShape = { id: string; enabled: boolean; [k: string]: any };

export const pluginStateKeys = ['plugins'] as const;

export const usePluginStore = defineStore('plugin', () => {
	const plugins = shallowRef<PluginItemShape[] | Record<string, PluginItemShape>>([]);

	function load() {
		void PluginManager?.load?.();
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

	function createData(...args: unknown[]) {
		return PluginManager?.createData?.(...args);
	}

	function getItemById(...args: unknown[]) {
		return PluginManager?.getItemById?.(...args);
	}

	function switchOverviewMode() {
		PluginManager?.switchOverviewMode?.();
	}

	function parseMeta(...args: unknown[]) {
		return PluginManager?.parseMeta?.(...args);
	}

	function reconstruct(...args: unknown[]) {
		return PluginManager?.reconstruct?.(...args);
	}

	function saveToProject(...args: unknown[]) {
		PluginManager?.saveToProject?.(...args);
	}

	function loadFromProject(...args: unknown[]) {
		PluginManager?.loadFromProject?.(...args);
	}

	function windowClose(...args: unknown[]) {
		PluginManager?.windowClose?.(...args);
	}

	function windowClosed(...args: unknown[]) {
		PluginManager?.windowClosed?.(...args);
	}

	function keydown(...args: unknown[]) {
		PluginManager?.keydown?.(...args);
	}

	function pointerdown(...args: unknown[]) {
		PluginManager?.pointerdown?.(...args);
	}

	function scriptChange(...args: unknown[]) {
		PluginManager?.scriptChange?.(...args);
	}

	function listKeydown(...args: unknown[]) {
		PluginManager?.listKeydown?.(...args);
	}

	function listSelect(...args: unknown[]) {
		PluginManager?.listSelect?.(...args);
	}

	function listUnselect(...args: unknown[]) {
		PluginManager?.listUnselect?.(...args);
	}

	function listChange(...args: unknown[]) {
		PluginManager?.listChange?.(...args);
	}

	function listPopup(...args: unknown[]) {
		PluginManager?.listPopup?.(...args);
	}

	function listOpen(...args: unknown[]) {
		PluginManager?.listOpen?.(...args);
	}

	function overviewPointerdown(...args: unknown[]) {
		PluginManager?.overviewPointerdown?.(...args);
	}

	function parameterPaneUpdate(...args: unknown[]) {
		PluginManager?.parameterPaneUpdate?.(...args);
	}

	function confirm(...args: unknown[]) {
		PluginManager?.confirm?.(...args);
	}

	function apply(...args: unknown[]) {
		PluginManager?.apply?.(...args);
	}

	function checkValidate(...args: unknown[]) {
		return PluginManager?.checkValidate?.(...args);
	}

	return {
		plugins,
		load,
		reload,
		initialize,
		open,
		unload,
		loadOverview,
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

export function getPluginStore() {
	return usePluginStore(pinia);
}
