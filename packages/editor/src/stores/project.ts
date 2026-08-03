import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useProjectStore = defineStore('project', () => {
	const state = shallowRef<string>('closed');
	const target = shallowRef<any>(null);

	function syncState() {
		const Project = (window as any).Project;
		state.value = Project?.state ?? 'closed';
		target.value = Project?.target ?? null;
	}

	function initialize() {
		(window as any).Project?.initialize?.();
	}

	function open() {
		(window as any).Project?.open?.();
	}

	function close() {
		(window as any).Project?.close?.();
	}

	function startTSC() {
		(window as any).Project?.startTSC?.();
	}

	function stopTSC() {
		(window as any).Project?.stopTSC?.();
	}

	function confirm(event?: any) {
		(window as any).Project?.confirm?.(event);
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
