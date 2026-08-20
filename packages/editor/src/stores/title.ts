import { defineStore } from 'pinia';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import { Title } from '@app/legacy/title/title-bar.ts';
import type { EditorProjectShape } from './editor';

export interface TitleShape {
	theme: string | null;
	playing: boolean;
	maximized: boolean;
	fullscreen: boolean;
}

export const titleStateKeys: (keyof TitleShape)[] = ['theme', 'playing', 'maximized', 'fullscreen'];

export const useTitleStore = defineStore('title', () => {
	const theme = shallowRef<string | null>(null);
	const playing = shallowRef<boolean>(false);
	const maximized = shallowRef<boolean>(false);
	const fullscreen = shallowRef<boolean>(false);

	function setPlaying(value: boolean) {
		playing.value = value;
	}

	function playGame() {
		Title.playGame?.();
	}

	function minimizeClick() {
		Title.minimizeClick?.();
	}

	function maximizeClick() {
		Title.maximizeClick?.();
	}

	function closeClick() {
		Title.closeClick?.();
	}

	function pointerenter() {
		Title.pointerenter?.();
	}

	function tabBarSelect(event: unknown) {
		Title.tabBarSelect?.(event);
	}

	function tabBarClosed(event: unknown) {
		Title.tabBarClosed?.(event);
	}

	function tabBarPopup(event: unknown) {
		Title.tabBarPopup?.(event);
	}

	function saveToConfig(config: { theme?: string }) {
		Title.saveToConfig?.(config);
	}

	function loadFromConfig(config: { theme?: string }) {
		Title.loadFromConfig?.(config);
	}

	function saveToProject(project: EditorProjectShape) {
		Title.saveToProject?.(project);
	}

	function loadFromProject(project: EditorProjectShape) {
		Title.loadFromProject?.(project);
	}

	return {
		theme,
		playing,
		maximized,
		fullscreen,
		setPlaying,
		playGame,
		minimizeClick,
		maximizeClick,
		closeClick,
		pointerenter,
		tabBarSelect,
		tabBarClosed,
		tabBarPopup,
		saveToConfig,
		loadFromConfig,
		saveToProject,
		loadFromProject
	};
});

export function getTitleStore() {
	return useTitleStore(pinia);
}
