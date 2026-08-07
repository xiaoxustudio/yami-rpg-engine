import { defineStore } from 'pinia';
import { Timer } from '@/util/timer.ts';
import { shallowRef } from 'vue';

export const useTimerStore = defineStore('timer', () => {
	const state = shallowRef<string>('idle');
	const timestamp = shallowRef<number>(0);
	const deltaTime = shallowRef<number>(0);
	const frameCount = shallowRef<number>(0);
	const tpf = shallowRef<number>(Infinity);

	function syncState() {
		state.value = Timer?.state ?? 'idle';
		timestamp.value = Timer?.timestamp ?? 0;
		deltaTime.value = Timer?.deltaTime ?? 0;
		frameCount.value = Timer?.frameCount ?? 0;
		tpf.value = Timer?.tpf ?? Infinity;
	}

	function initialize() {
		Timer?.initialize?.();
	}

	function start(ts: number) {
		Timer?.start?.(ts);
	}

	function update(ts: number) {
		Timer?.update?.(ts);
	}

	function play() {
		Timer?.play?.();
	}

	function appendUpdater(key: string, updater: (deltaTime: number) => void) {
		Timer?.appendUpdater?.(key, updater);
	}

	function removeUpdater(key: string, updater: (deltaTime: number) => void) {
		Timer?.removeUpdater?.(key, updater);
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
