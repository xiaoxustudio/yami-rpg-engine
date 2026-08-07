import { defineStore } from 'pinia';
import { Window } from '@/tools/window-object.ts';
import { shallowRef } from 'vue';

export const useWindowStore = defineStore('window', () => {
	const topWindow = shallowRef<any>(null);
	const windows = shallowRef<any[]>([]);

	function syncState() {
		topWindow.value = Window?.getTopWindow?.() ?? null;
	}

	function getTopWindow() {
		return Window?.getTopWindow?.() ?? null;
	}

	function confirm(options: any, buttons: any[]) {
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
		return Window?.isWindowOpen?.(id);
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

	function keydown(event: any) {
		Window?.keydown?.(event);
	}

	function cancel(event: any) {
		Window?.cancel?.(event);
	}

	return {
		topWindow,
		windows,
		syncState,
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
