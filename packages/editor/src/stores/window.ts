import { defineStore } from 'pinia';
import { Window } from '@app/tools/window-object.ts';
import { pinia } from './pinia';
import { shallowReactive, shallowRef } from 'vue';

export const windowStateKeys = [
	'positionMode',
	'absolutePos',
	'overlapRoot',
	'activeElement',
	'stack'
] as const;

export const useWindowStore = defineStore('window', () => {
	const positionMode = shallowRef<string>('center');
	const absolutePos = shallowRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const overlapRoot = shallowRef<HTMLElement | null>(null);
	const activeElement = shallowRef<Element | null>(null);
	const stack = shallowReactive<string[]>([]);

	function syncStack(ids: string[]) {
		stack.splice(0, stack.length, ...ids);
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

	/**
	 * 打开窗口，并在**控件可用之后**执行 `prepare`（懒挂载窗口会先挂载再执行）。
	 *
	 * `open()` 只保证同一 tick 完成 render，控件 API 是组件 `onMounted` 里接线的；
	 * 首次打开时紧接着写控件（填下拉项、`setForm`、改 style）会静默丢失甚至抛错。
	 * 所有「打开后要写控件」的地方都应走这里。
	 */
	function openWith(id: string, prepare?: (() => void) | null) {
		Window?.openWith?.(id, prepare ?? null);
	}

	function close(id?: string) {
		Window?.close?.(id);
	}

	function closeAll() {
		Window?.closeAll?.();
	}

	function isWindowOpen(id: string) {
		return stack.includes(id);
	}

	function getTopWindow() {
		return Window?.getTopWindow?.();
	}

	function getTopWindowId(): string | undefined {
		return stack[stack.length - 1];
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
		stack,
		syncStack,
		confirm,
		initialize,
		open,
		openWith,
		close,
		closeAll,
		isWindowOpen,
		getTopWindow,
		getTopWindowId,
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
