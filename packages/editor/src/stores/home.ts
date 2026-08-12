import { defineStore } from 'pinia';
import { Home } from '@/title/home-page.ts';
import { shallowRef } from 'vue';

export const useHomeStore = defineStore('home', () => {
	const state = shallowRef<string>('closed');

	function syncState() {
		state.value = Home?.state ?? 'closed';
	}

	function openProject(path: string) {
		Home?.openProject?.(path);
	}

	function createProject(path: string) {
		Home?.createProject?.(path);
	}

	function initialize() {
		Home?.initialize?.();
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

	function windowResize(event: Event) {
		Home?.windowResize?.(event);
	}

	function windowLocalize(event: Event) {
		Home?.windowLocalize?.(event);
	}

	function startClick(event: Event) {
		Home?.startClick?.(event);
	}

	function recentClick(event: Event) {
		Home?.recentClick?.(event);
	}

	function recentPointerup(event: Event) {
		Home?.recentPointerup?.(event);
	}

	return {
		state,
		syncState,
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
