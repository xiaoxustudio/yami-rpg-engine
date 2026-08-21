import { defineStore } from 'pinia';
import { AudioManager } from '@app/audio/audio-manager.ts';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export const useAudioStore = defineStore('audio', () => {
	const state = shallowRef<string>('closed');
	const music = shallowRef<any>(null);

	function initialize() {
		AudioManager?.initialize?.();
	}

	function close() {
		AudioManager?.close?.();
	}

	function getWaveform(guid: string) {
		return AudioManager?.getWaveform?.(guid);
	}

	function playMusic(name: string) {
		AudioManager?.playMusic?.(name);
	}

	function stopMusic() {
		AudioManager?.stopMusic?.();
	}

	function playSound(name: string) {
		AudioManager?.playSound?.(name);
	}

	return {
		state,
		music,
		initialize,
		close,
		getWaveform,
		playMusic,
		stopMusic,
		playSound
	};
});

export function getAudioStore() {
	return useAudioStore(pinia);
}
