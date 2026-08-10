import { defineStore } from 'pinia';
import { Menubar } from '@/title/menu-bar.ts';
import { pinia } from './pinia';
import { shallowRef } from 'vue';

export const useMenubarStore = defineStore('menubar', () => {
	const state = shallowRef<string>('closed');

	function syncState() {
		state.value = Menubar?.state ?? 'closed';
	}

	function popup(rect: any, menus: any[]) {
		Menubar?.popup?.(rect, menus);
	}

	function initialize() {
		Menubar?.initialize?.();
	}

	function toggleFullScreen() {
		Menubar?.toggleFullScreen?.();
	}

	function popupFileMenu(target: HTMLElement) {
		Menubar?.popupFileMenu?.(target);
	}

	function popupEditMenu(target: HTMLElement) {
		Menubar?.popupEditMenu?.(target);
	}

	function popupViewMenu(target: HTMLElement) {
		Menubar?.popupViewMenu?.(target);
	}

	function popupWindowMenu(target: HTMLElement) {
		Menubar?.popupWindowMenu?.(target);
	}

	function popupHelpMenu(target: HTMLElement) {
		Menubar?.popupHelpMenu?.(target);
	}

	function popupOpenYamiMenu(target: HTMLElement) {
		Menubar?.popupOpenYamiMenu?.(target);
	}

	function createRecentItems() {
		return Menubar?.createRecentItems?.();
	}

	function createLanguageItems() {
		return Menubar?.createLanguageItems?.();
	}

	function createColorIcon(color: string) {
		return Menubar?.createColorIcon?.(color);
	}

	function revealSaveDirectory() {
		return Menubar?.revealSaveDirectory?.();
	}

	function sanitizeFolderName(name: string) {
		return Menubar?.sanitizeFolderName?.(name);
	}

	function keydown(event: any) {
		Menubar?.keydown?.(event);
	}

	function pointerdown(event: any) {
		Menubar?.pointerdown?.(event);
	}

	function pointerup(event: any) {
		Menubar?.pointerup?.(event);
	}

	function pointerover(event: any) {
		Menubar?.pointerover?.(event);
	}

	function hrefClick(event: any) {
		Menubar?.hrefClick?.(event);
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

export function getMenubarStore() {
	return useMenubarStore(pinia);
}
