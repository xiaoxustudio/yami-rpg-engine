import { defineStore } from 'pinia';
import { shallowRef } from 'vue';

export const useWindowStore = defineStore('window', () => {
	const topWindow = shallowRef<any>(null);
	const windows = shallowRef<any[]>([]);

	function syncState() {
		const Window = (window as any).Window;
		topWindow.value = Window?.getTopWindow?.() ?? null;
	}

	function getTopWindow() {
		return (window as any).Window?.getTopWindow?.() ?? null;
	}

	function confirm(options: any, buttons: any[]) {
		return (window as any).Window?.confirm?.(options, buttons);
	}

	function alert(options: any, button?: any) {
		return (window as any).Window?.alert?.(options, button);
	}

	function initialize() {
		(window as any).Window?.initialize?.();
	}

	function open(id: string) {
		(window as any).Window?.open?.(id);
	}

	function close(id?: string) {
		(window as any).Window?.close?.(id);
	}

	function closeAll() {
		(window as any).Window?.closeAll?.();
	}

	function isWindowOpen(id: string) {
		return (window as any).Window?.isWindowOpen?.(id);
	}

	function setPositionMode(mode: string) {
		(window as any).Window?.setPositionMode?.(mode);
	}

	function saveActiveElement() {
		(window as any).Window?.saveActiveElement?.();
	}

	function restoreActiveElement() {
		(window as any).Window?.restoreActiveElement?.();
	}

	function refocus() {
		(window as any).Window?.refocus?.();
	}

	function keydown(event: any) {
		(window as any).Window?.keydown?.(event);
	}

	function cancel(event: any) {
		(window as any).Window?.cancel?.(event);
	}

	return {
		topWindow,
		windows,
		syncState,
		getTopWindow,
		confirm,
		alert,
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
