import { $ } from '@app/utils/dom';
import { createElementRegistry } from '@app/utils/element-registry';
import { addClass, removeClass } from '@app/utils/element-utils';
import { getWindowKeydowns } from '@app/tools/window-keydown-registry';
import { getLazyWindow } from '@app/tools/window-registry';
import { DynamicShape } from '@app/types/shapes.ts';
import { getConfirmationStore } from '@app/stores/confirmation';
import { nextTick } from 'vue';
import { ensureToolWindow, hasToolWindowLoader, mountToolWindow } from './tool-window-host';

const pendingToolWindowOpens = new Set<string>();

const Layout = getLazyWindow('layout', () =>
	import('@app/tools/window-cluster').then((m) => m.Layout)
);
const Title = getLazyWindow('title', () =>
	import('@app/tools/window-cluster').then((m) => m.Title)
);

type WindowFrame = HTMLElement & {
	open(): unknown;
	close(): boolean;
	closeEventEnabled: boolean;
	enableAmbient: boolean;
};

interface WindowShape extends DynamicShape {
	readonly ambient: YamiElement;
	frames: HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	};
	initialize: (() => void) | null;
	open: ((id: string) => void) | null;
	close: ((id?: string | null) => void) | null;
	closeAll: (() => void) | null;
	isWindowOpen: ((id: string) => boolean) | null;
	getTopWindow: (() => HTMLElement | undefined) | null;
	setPositionMode: ((mode: string) => void) | null;
	saveActiveElement: (() => void) | null;
	restoreActiveElement: (() => void) | null;
	refocus: (() => void) | null;
	confirm:
		| ((
				options: { message?: string; close?: () => void },
				items: Array<{ label?: string; click?: () => void }>
		  ) => void)
		| null;
	keydown: ((event: KeyboardEvent) => void) | null;
	cancel: ((event: Event) => void) | null;
}

export const Window: WindowShape = {
	get ambient() {
		return $('#window-ambient');
	},
	frames: [] as HTMLElement[] as HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	},
	initialize: null,
	open: null,
	close: null,
	closeAll: null,
	isWindowOpen: null,
	getTopWindow: null,
	setPositionMode: null,
	saveActiveElement: null,
	restoreActiveElement: null,
	refocus: null,
	confirm: null,
	keydown: null,
	cancel: null
};

Window.initialize = function (this: typeof Window) {
	void this;
};

Window.open = function (this: typeof Window, id: string) {
	const frames = this.frames;
	purgeStaleFrames();
	let element = windowShellEls.get(id) as WindowFrame | undefined;
	if (!element && mountToolWindow(id)) {
		element = windowShellEls.get(id) as WindowFrame | undefined;
		if (!element && !pendingToolWindowOpens.has(id)) {
			pendingToolWindowOpens.add(id);
			void nextTick().then(() => {
				pendingToolWindowOpens.delete(id);
				if (windowShellEls.get(id)) Window.open!(id);
				else console.warn('[window] open: element not found after mount:', id);
			});
			return;
		}
	}
	if (!element) {
		if (hasToolWindowLoader(id) && !pendingToolWindowOpens.has(id)) {
			pendingToolWindowOpens.add(id);
			void ensureToolWindow(id)
				.then((mounted) => {
					pendingToolWindowOpens.delete(id);
					if (!mounted) {
						console.warn('[window] open: tool loader failed:', id);
						return;
					}
					if (windowShellEls.get(id)) {
						Window.open!(id);
						return;
					}
					void nextTick().then(() => {
						if (windowShellEls.get(id)) Window.open!(id);
						else console.warn('[window] open: element not found after load:', id);
					});
				})
				.catch((error: unknown) => {
					pendingToolWindowOpens.delete(id);
					console.warn('[window] open: tool load failed:', id, error);
				});
			return;
		}
		console.warn('[window] open: element not found:', id);
		if (modalActive() && frames.length === 0) {
			deactivateModalMode();
		}
		return;
	}

	if (frames.includes(element) && !element.classList.contains('open')) {
		const hiddenIndex = frames.indexOf(element);
		frames.splice(hiddenIndex, 1);
		getWindowStore().syncStack(frames.map((f) => f.id));
		console.warn('[window] reopen hidden stacked frame:', element.id);
		if (frames.length === 0 && modalActive()) {
			deactivateModalMode();
		}
	}

	if (
		!frames.includes(element) &&
		frames.length > 0 &&
		frames[frames.length - 1] instanceof HTMLElement &&
		!frames[frames.length - 1].classList.contains('open')
	) {
		const ghost = frames.pop();
		getWindowStore().syncStack(frames.map((f) => f.id));
		console.warn('[window] purged hidden top frame:', ghost?.id);
		if (frames.length === 0 && modalActive()) {
			deactivateModalMode();
		}
	}

	const { activeElement } = document;
	if (!frames.includes(element)) {
		(element as WindowFrame).open();
		if (!Title.target) {
			Title.target = windowShellEls.get('title') as typeof Title.target;
		}
		if (Title.target) {
			Title.target.tabIndex = -1;
			(Title.target as HTMLElement & { focus(options?: FocusOptions): void }).focus({
				preventScroll: true
			});
			setTimeout(() => {
				const active = document.activeElement;
				if (active === activeElement && frames[frames.length - 1] === element) {
					(Title.target as HTMLElement & { focus(options?: FocusOptions): void }).focus({
						preventScroll: true
					});
				}
			});
		}
	} else if (element.classList.contains('open')) {
		console.warn('[window] open no-op (already stacked & open):', id);
		const index = frames.indexOf(element);
		if (index !== frames.length - 1) {
			frames.splice(index, 1);
			frames.push(element);
			getWindowStore().syncStack(frames.map((f) => f.id));
		}
		element.style.zIndex = String(frames.length);
		Window.ambient.update();
		(element as WindowFrame & { focus(): void }).focus?.();
	}
};

Window.close = function (this: typeof Window, id: string | null = null) {
	const frames = this.frames;
	purgeStaleFrames();
	if (frames.length === 0) {
		if (modalActive()) {
			deactivateModalMode();
		}
		return;
	}

	const element = frames[frames.length - 1];
	if (id && id !== element.id) {
		return;
	}

	if ((element as WindowFrame).close()) {
		if (element.id === 'confirmation') {
			getConfirmationStore().clear();
		}
		window.scrollTo(0, 0);
		window.scrollTo(0, 0);
		if (getWindowStore().overlapRoot === element) {
			this.setPositionMode!('center');
		}
		if (modalActive() && frames.length === 0) {
			deactivateModalMode();
		}
	}
};

Window.closeAll = function (this: typeof Window) {
	const frames = this.frames;
	let i = frames.length;
	while (--i >= 0) {
		const frame = frames[i];
		const enabled = (frame as WindowFrame).closeEventEnabled;
		(frame as WindowFrame).closeEventEnabled = false;
		this.close!(frame.id);
		(frame as WindowFrame).closeEventEnabled = enabled;
	}
};

Window.isWindowOpen = function (this: typeof Window, id: string) {
	for (const frame of this.frames) {
		if (frame.id === id) return true;
	}
	return false;
};

Window.getTopWindow = function (this: typeof Window) {
	const { frames } = this;
	if (frames.length !== 0) {
		return frames[frames.length - 1];
	}
	return undefined;
};

Window.setPositionMode = function (this: typeof Window, mode: string) {
	const store = getWindowStore();
	if (store.positionMode !== mode) {
		if (store.overlapRoot) {
			store.overlapRoot = null;
		}
		switch (mode) {
			case 'center':
				break;
			case 'absolute':
				break;
			case 'overlap': {
				const { frames } = this;
				const { length } = frames;
				if (length === 0) return;
				store.overlapRoot = frames[length - 1];
				break;
			}
		}
		store.positionMode = mode;
	}
};

Window.saveActiveElement = function (this: typeof Window) {
	const { activeElement } = document;
	if (activeElement !== null && activeElement !== document.body) {
		getWindowStore().activeElement = activeElement;
		(activeElement as HTMLElement).blur();
	}
};

Window.restoreActiveElement = function (this: typeof Window) {
	const store = getWindowStore();
	if (store.activeElement) {
		(store.activeElement as HTMLElement & { focus(options?: FocusOptions): void }).focus({
			preventScroll: true
		});
		store.activeElement = null;
	}
};

Window.refocus = function (this: typeof Window) {
	const active = document.activeElement;
	if (active !== document.body) {
		(active as HTMLElement | null)?.blur();
		(active as HTMLElement | null)?.focus();
	}
};

Window.confirm = function (
	this: typeof Window,
	options: { message?: string; close?: () => void },
	items: Array<{ label?: string; click?: () => void }>
) {
	getConfirmationStore().confirm(options, items);
};

Window.keydown = function (this: typeof Window, event: KeyboardEvent) {
	if (event.altKey) {
		switch (event.code) {
			case 'F4':
				event.preventDefault();
				Window.refocus!();
				Window.close!();
				break;
		}
	} else {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter': {
				const active = document.activeElement;
				if (active instanceof HTMLButtonElement && !(event.ctrlKey || event.metaKey)) {
					return;
				}
				const frames = Window.frames;
				const frame = frames[frames.length - 1];
				const button = frame?.querySelector('content-frame > button[name=confirm]');
				if (button instanceof HTMLButtonElement) {
					event.preventDefault();
					if (active !== document.body) {
						(active as HTMLElement | null)?.blur();
					}
					button.click();
				}
				break;
			}
			case 'KeyS': {
				if (!(event.ctrlKey || event.metaKey)) return;
				const frames = Window.frames;
				const frame = frames[frames.length - 1];
				const button = frame?.querySelector('content-frame > button[name=apply]');
				if (button instanceof HTMLButtonElement) {
					const active = document.activeElement;
					if (active !== document.body) {
						(active as HTMLElement | null)?.blur();
						(active as HTMLElement | null)?.focus();
					}
					button.click();
				}
				break;
			}
			case 'Escape':
				Window.refocus!();
				Window.close!();
				break;
		}
	}
};

Window.cancel = function (this: typeof Window, event: Event) {
	let element = (event.target as HTMLElement).parentNode;
	while (element) {
		if ((element as HTMLElement).classList.contains('window-frame')) {
			return Window.close!((element as HTMLElement).id);
		} else {
			element = element.parentNode;
		}
	}
};

Window.ambient.update = function (this: typeof Window) {
	const { frames } = Window;
	const { ambient } = Window;
	let i = frames.length;
	while (--i >= 0) {
		const frame = frames[i];
		if ((frame as WindowFrame).enableAmbient) {
			addClass(ambient, 'open');
			ambient.style.zIndex = (i + 1).toString();
			return;
		}
	}
	removeClass(ambient, 'open');
};

const windowBridgeKeys = ['positionMode', 'absolutePos', 'overlapRoot', 'activeElement'] as const;
import { getWindowStore } from '@app/stores/window';
import type { YamiElement } from '@app/types/element-api';

export const windowShellEls = createElementRegistry();

for (const key of windowBridgeKeys) {
	Object.defineProperty(Window, key, {
		get: () => getWindowStore()[key],
		set: (value: unknown) => {
			Reflect.set(getWindowStore(), key, value);
		},
		configurable: true
	});
}

const activateModalMode = (): void => {
	document.body.style.pointerEvents = 'none';
	try {
		Title.pointermove!({ target: null });
	} catch (e: unknown) {
		console.error('[window] activate Title.pointermove error:', e);
	}
	try {
		Window.saveActiveElement!();
	} catch (e: unknown) {
		console.error('[window] activate saveActiveElement error:', e);
	}
	try {
		Layout.disableFocusableElements();
	} catch (e: unknown) {
		console.error('[window] activate disableFocusableElements error:', e);
	}
	try {
		(document.activeElement as HTMLElement | null)?.blur();
	} catch (e: unknown) {
		console.error('[window] activate blur error:', e);
	}
	for (const handler of getWindowKeydowns()) {
		window.removeEventListener('keydown', handler);
	}
	window.removeEventListener('keydown', Window.keydown!);
	window.addEventListener('keydown', Window.keydown!);
};

const deactivateModalMode = (): void => {
	document.body.style.pointerEvents = 'inherit';
	try {
		Title.pointerenter!();
	} catch (e: unknown) {
		console.error('[window] deactivate Title.pointerenter error:', e);
	}
	try {
		Window.restoreActiveElement!();
	} catch (e: unknown) {
		console.error('[window] deactivate restoreActiveElement error:', e);
	}
	try {
		Layout.enableFocusableElements();
	} catch (e: unknown) {
		console.error('[window] deactivate enableFocusableElements error:', e);
	}
	for (const handler of getWindowKeydowns()) {
		window.addEventListener('keydown', handler);
	}
	window.removeEventListener('keydown', Window.keydown!);
};

const frames = Window.frames;

const modalActive = (): boolean => document.body.style.pointerEvents === 'none';

const purgeStaleFrames = (allowHidden = false): void => {
	const stale: string[] = [];
	for (let i = frames.length - 1; i >= 0; i--) {
		const frame = frames[i];
		const detached = !(frame instanceof HTMLElement) || !document.contains(frame);
		const hidden =
			allowHidden && frame instanceof HTMLElement && !frame.classList.contains('open');
		if (detached || hidden) {
			stale.push(frame?.id ?? '?');
			frames.splice(i, 1);
		}
	}
	if (stale.length === 0) return;
	console.warn('[window] purged stale frames:', stale.join(', '));
	try {
		getWindowStore().syncStack(frames.map((f) => f.id));
	} catch (error) {
		console.error('[window] frames.syncStack error:', error);
	}
	if (frames.length === 0 && modalActive()) {
		deactivateModalMode();
	} else if (frames.length > 0) {
		frames[frames.length - 1].focus();
	}
};

Object.defineProperty(frames, 'append', {
	configurable: true,
	value: (element: HTMLElement) => {
		if (frames.includes(element)) {
			console.warn('[window] append duplicate:', element.id);
			return false;
		}
		purgeStaleFrames();
		try {
			if (frames.length === 0) {
				activateModalMode();
			} else {
				frames[frames.length - 1].blur();
			}
		} catch (error) {
			console.error('[window] frames.append error:', error);
		}
		frames.push(element);
		try {
			getWindowStore().syncStack(frames.map((f) => f.id));
		} catch (error) {
			console.error('[window] frames.syncStack error:', error);
		}
		return true;
	}
});
Object.defineProperty(frames, 'remove', {
	configurable: true,
	value: (element: HTMLElement) => {
		const index = frames.indexOf(element);
		if (index === -1) {
			console.warn('[window] frames.remove: element not in stack', element.id);
			return false;
		}
		try {
			const closingOpen = element.classList.contains('open');
			frames.splice(index, 1);
			purgeStaleFrames(closingOpen);
			getWindowStore().syncStack(frames.map((f) => f.id));
			if (frames.length === 0) {
				deactivateModalMode();
			} else {
				frames[frames.length - 1].focus();
			}
		} catch (error) {
			console.error('[window] frames.remove restore error:', error);
			if (frames.length === 0) {
				document.body.style.pointerEvents = 'inherit';
			}
		}
		return true;
	}
});

Reflect.set(window, 'Window', Window);

import { setWindowFramesLengthProvider } from '@ui-kit';
setWindowFramesLengthProvider(() => Window.frames.length + 1);
