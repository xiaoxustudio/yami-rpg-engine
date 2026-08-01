import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useMenubarStore = defineStore('menubar', () => {
	const state = shallowRef<string>('closed');

	function syncState() {
		state.value = (window as any).Menubar?.state ?? 'closed';
	}

	function popup(rect: any, menus: any[]) {
		(window as any).Menubar?.popup?.(rect, menus);
	}

	function initialize() {
		(window as any).Menubar?.initialize?.();
	}

	function toggleFullScreen() {
		(window as any).Menubar?.toggleFullScreen?.();
	}

	function popupFileMenu(target: any) {
		(window as any).Menubar?.popupFileMenu?.(target);
	}

	function popupEditMenu(target: any) {
		(window as any).Menubar?.popupEditMenu?.(target);
	}

	function popupViewMenu(target: any) {
		(window as any).Menubar?.popupViewMenu?.(target);
	}

	function popupWindowMenu(target: any) {
		(window as any).Menubar?.popupWindowMenu?.(target);
	}

	function popupHelpMenu(target: any) {
		(window as any).Menubar?.popupHelpMenu?.(target);
	}

	function popupOpenYamiMenu(target: any) {
		(window as any).Menubar?.popupOpenYamiMenu?.(target);
	}

	function createRecentItems() {
		return (window as any).Menubar?.createRecentItems?.();
	}

	function createLanguageItems() {
		return (window as any).Menubar?.createLanguageItems?.();
	}

	function createColorIcon(color: string) {
		return (window as any).Menubar?.createColorIcon?.(color);
	}

	function revealSaveDirectory() {
		return (window as any).Menubar?.revealSaveDirectory?.();
	}

	function sanitizeFolderName(name: string) {
		return (window as any).Menubar?.sanitizeFolderName?.(name);
	}

	function keydown(event: any) {
		(window as any).Menubar?.keydown?.(event);
	}

	function pointerdown(event: any) {
		(window as any).Menubar?.pointerdown?.(event);
	}

	function pointerup(event: any) {
		(window as any).Menubar?.pointerup?.(event);
	}

	function pointerover(event: any) {
		(window as any).Menubar?.pointerover?.(event);
	}

	function hrefClick(event: any) {
		(window as any).Menubar?.hrefClick?.(event);
	}

	return {
		state,
		syncState,
		popup,
		initialize,
		toggleFullScreen,
		popupFileMenu,
		popupEditMenu,
		popupViewMenu,
		popupWindowMenu,
		popupHelpMenu,
		popupOpenYamiMenu,
		createRecentItems,
		createLanguageItems,
		createColorIcon,
		revealSaveDirectory,
		sanitizeFolderName,
		keydown,
		pointerdown,
		pointerup,
		pointerover,
		hrefClick
	};
});
