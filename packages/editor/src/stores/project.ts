import { defineStore } from 'pinia';
import { Project } from '@/data/project-settings-window.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const projectStateKeys = ['state', 'target', 'data'] as const;

type ProjectDataShape = {
	window: { title: string };
	localization: { languages: Array<{ name: string; font: string; scale: number }> };
	[k: string]: unknown;
};

export const useProjectStore = defineStore('project', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);
	const data = shallowRef<ProjectDataShape | null>(null);

	function syncState() {
		state.value = Project?.state ?? 'closed';
		target.value = Project?.target ?? null;
		data.value = Project?.data ?? null;
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
		data,
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
