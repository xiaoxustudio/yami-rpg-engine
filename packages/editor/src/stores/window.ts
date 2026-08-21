import { defineStore } from 'pinia';
import { Window } from '@app/tools/window-object.ts';
import { pinia } from './pinia';
import { shallowRef } from 'vue';

export const windowStateKeys = [
	'positionMode',
	'absolutePos',
	'overlapRoot',
	'activeElement'
] as const;

export const useWindowStore = defineStore('window', () => {
	const positionMode = shallowRef<string>('center');
	const absolutePos = shallowRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const overlapRoot = shallowRef<HTMLElement | null>(null);
	const activeElement = shallowRef<Element | null>(null);

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

	function getTopWindow() {
		return Window?.getTopWindow?.();
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
		positionMode,
		absolutePos,
		overlapRoot,
		activeElement,
		confirm,
		initialize,
		open,
		close,
		closeAll,
		isWindowOpen,
		getTopWindow,
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
