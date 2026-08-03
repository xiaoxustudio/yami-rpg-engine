import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useTimerStore = defineStore('timer', () => {
	const state = shallowRef<string>('idle');
	const timestamp = shallowRef<number>(0);
	const deltaTime = shallowRef<number>(0);
	const frameCount = shallowRef<number>(0);
	const tpf = shallowRef<number>(Infinity);

	function syncState() {
		const Timer = (window as any).Timer;
		state.value = Timer?.state ?? 'idle';
		timestamp.value = Timer?.timestamp ?? 0;
		deltaTime.value = Timer?.deltaTime ?? 0;
		frameCount.value = Timer?.frameCount ?? 0;
		tpf.value = Timer?.tpf ?? Infinity;
	}

	function initialize() {
		(window as any).Timer?.initialize?.();
	}

	function start(ts: number) {
		(window as any).Timer?.start?.(ts);
	}

	function update(ts: number) {
		(window as any).Timer?.update?.(ts);
	}

	function play() {
		(window as any).Timer?.play?.();
	}

	function appendUpdater(key: string, updater: (deltaTime: number) => void) {
		(window as any).Timer?.appendUpdater?.(key, updater);
	}

	function removeUpdater(key: string, updater: (deltaTime: number) => void) {
		(window as any).Timer?.removeUpdater?.(key, updater);
	}

	return {
		state,
		timestamp,
		deltaTime,
		frameCount,
		tpf,
		syncState,
		initialize,
		start,
		update,
		play,
		appendUpdater,
		removeUpdater
	};
});
