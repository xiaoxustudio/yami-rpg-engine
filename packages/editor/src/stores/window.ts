import { defineStore } from 'pinia';
import { Window } from '@/tools/window-object.ts';
import { pinia } from './pinia';
import { shallowRef } from 'vue';

export const useWindowStore = defineStore('window', () => {
	const topWindow = shallowRef<HTMLElement | null>(null);
	const windows = shallowRef<HTMLElement[]>([]);

	function syncState() {
		topWindow.value = Window?.getTopWindow?.() ?? null;
		windows.value = [...(Window?.frames ?? [])];
	}

	function getWindows(): HTMLElement[] {
		return [...(Window?.frames ?? [])];
	}

	function getTopWindow(): HTMLElement | null {
		return Window?.getTopWindow?.() ?? null;
	}

	interface WindowButton {
		label?: string;
		click?: () => void;
	}
	function confirm(options: { message?: string; close?: () => void }, buttons: WindowButton[]) {
		return Window?.confirm?.(options, buttons);
	}

	function initialize() {
		Window?.initialize?.();
	}

	function open(id: string) {
		Window?.open?.(id);
	}

	function close(id?: string) {
		Window?.close?.(id);
	}

	function closeAll() {
		Window?.closeAll?.();
	}

	function isWindowOpen(id: string) {
		return Window?.isWindowOpen?.(id) ?? false;
	}

	function setPositionMode(mode: string) {
		Window?.setPositionMode?.(mode);
	}

	function saveActiveElement() {
		Window?.saveActiveElement?.();
	}

	function restoreActiveElement() {
		Window?.restoreActiveElement?.();
	}

	function refocus() {
		Window?.refocus?.();
	}

	function keydown(event: KeyboardEvent) {
		Window?.keydown?.(event);
	}

	function cancel(event: Event) {
		Window?.cancel?.(event);
	}

	return {
		topWindow,
		windows,
		syncState,
		getWindows,
		getTopWindow,
		confirm,
		initialize,
		open,
		close,
		closeAll,
		isWindowOpen,
		setPositionMode,
		saveActiveElement,
		restoreActiveElement,
		refocus,
		keydown,
		cancel
	};
});

export function getWindowStore() {
	return useWindowStore(pinia);
}
