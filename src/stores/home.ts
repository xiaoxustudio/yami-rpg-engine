import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useHomeStore = defineStore('home', () => {
	const state = shallowRef<string>('closed');

	function syncState() {
		state.value = (window as any).Home?.state ?? 'closed';
	}

	function openProject(path: string) {
		(window as any).Home?.openProject?.(path);
	}

	function createProject(path: string) {
		(window as any).Home?.createProject?.(path);
	}

	function initialize() {
		(window as any).Home?.initialize?.();
	}

	function updateCenterPosition() {
		(window as any).Home?.updateCenterPosition?.();
	}

	function parseRecentProjects() {
		(window as any).Home?.parseRecentProjects?.();
	}

	function removeRecentProject(index: number) {
		(window as any).Home?.removeRecentProject?.(index);
	}

	function readFileList(path: string) {
		return (window as any).Home?.readFileList?.(path);
	}

	function countFileList(path: string) {
		return (window as any).Home?.countFileList?.(path);
	}

	function windowResize(event: any) {
		(window as any).Home?.windowResize?.(event);
	}

	function windowLocalize(event: any) {
		(window as any).Home?.windowLocalize?.(event);
	}

	function startClick(event: any) {
		(window as any).Home?.startClick?.(event);
	}

	function recentClick(event: any) {
		(window as any).Home?.recentClick?.(event);
	}

	function recentPointerup(event: any) {
		(window as any).Home?.recentPointerup?.(event);
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
