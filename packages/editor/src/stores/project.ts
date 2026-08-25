import { defineStore } from 'pinia';
import { Project } from '@app/data/project-settings-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const projectStateKeys = ['state', 'target', 'data'] as const;

export const useProjectStore = defineStore('project', () => {
	const state = shallowRef<string>('closed');
	// oxlint-disable-next-line no-explicit-any
	const target = shallowRef<any>(null);
	// oxlint-disable-next-line no-explicit-any
	const data = shallowRef<any>(null);

	function initialize() {
		Project?.initialize?.();
	}

	function open() {
		Project?.open?.();
	}

	function close() {
		Project?.close?.();
	}

	function startTSC() {
		Project?.startTSC?.();
	}

	function stopTSC() {
		Project?.stopTSC?.();
	}

	function confirm(event?: Event) {
		Project?.confirm?.(event!);
	}

	return {
		state,
		target,
		data,
		initialize,
		open,
		close,
		startTSC,
		stopTSC,
		confirm
	};
});

export function getProjectStore() {
	return useProjectStore(pinia);
}
