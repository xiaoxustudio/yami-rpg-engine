import { defineStore } from 'pinia';
import { Project } from '@/data/project-settings-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const useProjectStore = defineStore('project', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		state.value = Project?.state ?? 'closed';
		target.value = Project?.target ?? null;
	}

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
		syncState,
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
