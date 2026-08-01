import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useAudioStore = defineStore('audio', () => {
	const state = shallowRef<string>('closed');
	const music = shallowRef<any>(null);

	function syncState() {
		const AudioManager = (window as any).AudioManager;
		state.value = AudioManager?.state ?? 'closed';
		music.value = AudioManager?.music ?? null;
	}

	function initialize() {
		(window as any).AudioManager?.initialize?.();
	}

	function close() {
		(window as any).AudioManager?.close?.();
	}

	function getWaveform(guid: string) {
		return (window as any).AudioManager?.getWaveform?.(guid);
	}

	function playMusic(name: string) {
		(window as any).AudioManager?.playMusic?.(name);
	}

	function stopMusic() {
		(window as any).AudioManager?.stopMusic?.();
	}

	function playSound(name: string) {
		(window as any).AudioManager?.playSound?.(name);
	}

	return {
		state,
		music,
		syncState,
		initialize,
		close,
		getWaveform,
		playMusic,
		stopMusic,
		playSound
	};
});
