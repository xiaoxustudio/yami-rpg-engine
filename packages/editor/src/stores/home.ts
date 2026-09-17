import { defineStore } from 'pinia';
import { getLazyWindow, loadWindow } from '@app/tools/window-registry';
import { shallowRef } from 'vue';
import { pinia } from './pinia';
import type { YamiMouseEvent } from '@app/types/editor-event';

const loadHome = () =>
	import('@app/tools/window-cluster').then(async (m) => {
		await m.clusterReady;
		return m.Home;
	});
const Home = getLazyWindow('home', loadHome);

export interface HomeShape {
	state: string;
}

export const homeStateKeys: (keyof HomeShape)[] = ['state'];

export const useHomeStore = defineStore('home', () => {
	const state = shallowRef<string>('closed');

	function openProject(path: string) {
		Home?.openProject?.(path);
	}

	function createProject(path: string) {
		Home?.createProject?.(path);
	}

	function initialize() {
		void loadWindow('home', loadHome).then((h) => h?.initialize?.());
	}

	function updateCenterPosition() {
		Home?.updateCenterPosition?.();
	}

	function parseRecentProjects() {
		Home?.parseRecentProjects?.();
	}

	function removeRecentProject(index: number) {
		Home?.removeRecentProject?.(index);
	}

	function readFileList(path: string) {
		return Home?.readFileList?.(path);
	}

	function countFileList(path: string) {
		return Home?.countFileList?.(path);
	}

	function windowResize(event: YamiMouseEvent) {
		Home?.windowResize?.(event);
	}

	function windowLocalize(event: YamiMouseEvent) {
		Home?.windowLocalize?.(event);
	}

	function startClick(event: YamiMouseEvent) {
		Home?.startClick?.(event);
	}

	function recentClick(event: YamiMouseEvent) {
		Home?.recentClick?.(event);
	}

	function recentPointerup(event: YamiMouseEvent) {
		Home?.recentPointerup?.(event);
	}

	return {
		state,
		openProject,
		createProject,
		initialize,
		updateCenterPosition,
		parseRecentProjects,
		removeRecentProject,
		readFileList,
		countFileList,
		windowResize,
		windowLocalize,
		startClick,
		recentClick,
		recentPointerup
	};
});

export function getHomeStore() {
	return useHomeStore(pinia);
}
