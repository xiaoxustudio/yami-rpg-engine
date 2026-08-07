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

	function windowResize(event: any) {
		Home?.windowResize?.(event);
	}

	function windowLocalize(event: any) {
		Home?.windowLocalize?.(event);
	}

	function startClick(event: any) {
		Home?.startClick?.(event);
	}

	function recentClick(event: any) {
		Home?.recentClick?.(event);
	}

	function recentPointerup(event: any) {
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
