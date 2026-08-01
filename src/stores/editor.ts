import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useEditorStore = defineStore('editor', () => {
	const state = shallowRef<string>('closed');
	const config = shallowRef<any>(null);
	const project = shallowRef<any>(null);

	function syncState() {
		const Editor = (window as any).Editor;
		state.value = Editor?.state ?? 'closed';
		config.value = Editor?.config ?? null;
		project.value = Editor?.project ?? null;
	}

	function initialize() {
		(window as any).Editor?.initialize?.();
	}

	function open(...args: any[]) {
		(window as any).Editor?.open?.(...args);
	}

	function close(...args: any[]) {
		(window as any).Editor?.close?.(...args);
	}

	function quit(...args: any[]) {
		(window as any).Editor?.quit?.(...args);
	}

	function updatePath(...args: any[]) {
		(window as any).Editor?.updatePath?.(...args);
	}

	function switchHotkey(...args: any[]) {
		(window as any).Editor?.switchHotkey?.(...args);
	}

	function saveConfig(...args: any[]) {
		(window as any).Editor?.saveConfig?.(...args);
	}

	function loadConfig(...args: any[]) {
		(window as any).Editor?.loadConfig?.(...args);
	}

	function saveProject(...args: any[]) {
		(window as any).Editor?.saveProject?.(...args);
	}

	function loadProject(...args: any[]) {
		(window as any).Editor?.loadProject?.(...args);
	}

	function saveManifest(...args: any[]) {
		(window as any).Editor?.saveManifest?.(...args);
	}

	function checkForEditorUpdates(...args: any[]) {
		(window as any).Editor?.checkForEditorUpdates?.(...args);
	}

	function checkForProjectUpdates(...args: any[]) {
		(window as any).Editor?.checkForProjectUpdates?.(...args);
	}

	function isProjectVersionSupported(...args: any[]) {
		return (window as any).Editor?.isProjectVersionSupported?.(...args);
	}

	return {
		state,
		config,
		project,
		syncState,
		initialize,
		open,
		close,
		quit,
		updatePath,
		switchHotkey,
		saveConfig,
		loadConfig,
		saveProject,
		loadProject,
		saveManifest,
		checkForEditorUpdates,
		checkForProjectUpdates,
		isProjectVersionSupported
	};
});
