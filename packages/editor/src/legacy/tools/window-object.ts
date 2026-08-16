import { $ } from '@/util/dom.ts';
import { addClass, removeClass } from '@/util/element-utils';
import { Scene } from '@/scene/scene-window.ts';
import { UI } from '@/ui/ui-window.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Layout } from '@app/engine/layout/layout.ts';
import { Particle } from '@/particle/particle-window.ts';
import { Menubar } from '@/title/menu-bar.ts';
import { Title } from '@/title/title-bar.ts';
import { DynamicShape } from '@/types/legacy-shapes.ts';
import { getConfirmationStore } from '@app/stores/confirmation';

type WindowFrame = HTMLElement & {
	open(): unknown;
	close(): boolean;
	closeEventEnabled: boolean;
	enableAmbient: boolean;
};

interface WindowShape extends DynamicShape {
	readonly ambient: HTMLElement;
	frames: HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	};
	afterChange: (() => void) | null;
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
	frames: [] as HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	},
	afterChange: null,
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
	const buttons = document.getElementsByName('cancel');
	const length = buttons.length;
	for (let i = 0; i < length; i++) {
		buttons[i].addEventListener('click', this.cancel!);
	}
};

Window.open = function (this: typeof Window, id: string) {
	const frames = this.frames;
	const element = document.getElementById(id);
	if (!element) {
		return;
	}

	const { activeElement } = document;
	if (!frames.includes(element)) {
		if (frames.length > 0) {
			frames[frames.length - 1].blur();
		} else {
			document.body.style.pointerEvents = 'none';
			Title.pointermove!({ target: null });
			Window.saveActiveElement!();
			Layout.disableFocusableElements();
			document.activeElement!.blur();
			window.removeEventListener('keydown', Menubar.keydown!);
			window.removeEventListener('keydown', Scene.keydown);
			window.removeEventListener('keydown', UI.keydown);
			window.removeEventListener('keydown', Animation.keydown);
			window.removeEventListener('keydown', Particle.keydown!);
			window.addEventListener('keydown', Window.keydown!);
		}

		// 解决失去焦点后还能使用键盘滚动的问题 延时获得焦点是为了解决鼠标按下瞬间焦点切换被阻止的问题
		if (!Title.target) {
			Title.target = $('#title');
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
		(element as WindowFrame).open();
		this.afterChange?.();
	}
};

Window.close = function (this: typeof Window, id: string | null = null) {
	const frames = this.frames;
	if (!frames.length) {
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
		// 窗口关闭可能触发 focus 滚动/布局变化导致页面 scrollY 偏移（顶栏滚出视口），强制归零
		window.scrollTo(0, 0);
		try {
			if (frames.length > 0) {
				frames[frames.length - 1].focus();
			} else {
				document.body.style.pointerEvents = 'inherit';
				Title.pointerenter!();
				Window.restoreActiveElement!();
				Layout.enableFocusableElements();
				window.addEventListener('keydown', Menubar.keydown!);
				window.addEventListener('keydown', Scene.keydown);
				window.addEventListener('keydown', UI.keydown);
				window.addEventListener('keydown', Animation.keydown);
				window.addEventListener('keydown', Particle.keydown!);
				window.removeEventListener('keydown', Window.keydown!);
			}
		} catch (error) {
			console.error('[window] close restore error:', error);
		}
		window.scrollTo(0, 0);
		if (getWindowStore().overlapRoot === element) {
			this.setPositionMode!('center');
		}
		this.afterChange?.();
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
		activeElement.blur();
	}
};

Window.restoreActiveElement = function (this: typeof Window) {
	const store = getWindowStore();
	if (store.activeElement) {
		// preventScroll 防止 focus 触发浏览器滚动（body overflow hidden 下 scrollY 变化会把顶栏滚出视口）
		(store.activeElement as HTMLElement).focus();
		store.activeElement = null;
	}
};

Window.refocus = function (this: typeof Window) {
	const active = document.activeElement;
	if (active !== document.body) {
		active!.blur();
		active!.focus();
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
				const selector = `#${frame.id} > content-frame > button[name=confirm]`;
				const button = document.querySelector(selector);
				if (button instanceof HTMLButtonElement) {
					event.preventDefault();
					if (active !== document.body) {
						active!.blur();
					}
					button.click();
				}
				break;
			}
			case 'KeyS': {
				if (!(event.ctrlKey || event.metaKey)) return;
				const frames = Window.frames;
				const frame = frames[frames.length - 1];
				const selector = `#${frame.id} > content-frame > button[name=apply]`;
				const button = document.querySelector(selector);
				if (button instanceof HTMLButtonElement) {
					const active = document.activeElement;
					if (active !== document.body) {
						// 调用blur来触发change事件
						active!.blur();
						active!.focus();
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

for (const key of windowBridgeKeys) {
	Object.defineProperty(Window, key, {
		get: () => getWindowStore()[key],
		set: (value: any) => {
			(getWindowStore() as unknown as Record<string, any>)[key] = value;
		},
		configurable: true
	});
}

(window as unknown as { Window: typeof Window }).Window = Window;
