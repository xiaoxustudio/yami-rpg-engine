import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';

export interface TitleShape {
	theme: string | null;
	playing: boolean;
}

export const titleStateKeys: (keyof TitleShape)[] = ['theme', 'playing'];

export const useTitleStore = defineStore('title', () => {
	const theme = shallowRef<string | null>(null);
	const playing = shallowRef<boolean>(false);

	function setPlaying(value: boolean) {
		playing.value = value;
	}

	return { theme, playing, setPlaying };
});

export function getTitleStore() {
	return useTitleStore(pinia);
}
