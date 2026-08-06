import { $, measureText } from '@/util/dom.ts';
import { addClass, getFocus, hide, removeClass, show } from '@/util/element-utils';
import { Scene } from '@/scene/scene-window.ts';
import { UI } from '@/ui/ui-window.ts';
import { Animation } from '@/animation/animation-window.ts';
import { Layout } from '@/layout/layout.ts';
import { Particle } from '@/particle/particle-window.ts';
import { Menubar } from '@/title/menu-bar.ts';
import { Title } from '@/title/title-bar.ts';

export const Window = {
	get ambient() {
		return $('#window-ambient');
	},
	frames: [] as HTMLElement[],
	positionMode: 'center',
	absolutePos: { x: 0, y: 0 },
	overlapRoot: null as HTMLElement | null,
	activeElement: null as Element | null,
	initialize: null as (() => void) | null,
	open: null as ((id: string) => void) | null,
	close: null as ((id?: string | null) => void) | null,
	closeAll: null as (() => void) | null,
	isWindowOpen: null as ((id: string) => boolean) | null,
	getTopWindow: null as (() => HTMLElement | undefined) | null,
	setPositionMode: null as ((mode: string) => void) | null,
	saveActiveElement: null as (() => void) | null,
	restoreActiveElement: null as (() => void) | null,
	refocus: null as (() => void) | null,
	confirm: null as ((options: any, items: any) => void) | null,
	keydown: null as ((event: KeyboardEvent) => void) | null,
	cancel: null as ((event: any) => void) | null
};

Window.initialize = function (this: any) {
	const buttons = document.getElementsByName('cancel');
	const length = buttons.length;
	for (let i = 0; i < length; i++) {
		buttons[i].addEventListener('click', this.cancel!);
	}
};

Window.open = function (this: any, id: string) {
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
			Title.pointermove!({ target: null });
			Window.saveActiveElement!();
			Layout.disableFocusableElements();
			document.body.style.pointerEvents = 'none';
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
		(element as any).open();
	}
};

Window.close = function (this: any, id: string | null = null) {
	const frames = this.frames;
	if (!frames.length) {
		return;
	}

	const element = frames[frames.length - 1];
	if (id && id !== element.id) {
		return;
	}

	if ((element as any).close()) {
		document.body.style.pointerEvents = 'inherit';
		// 窗口关闭可能触发 focus 滚动/布局变化导致页面 scrollY 偏移（顶栏滚出视口），强制归零
		window.scrollTo(0, 0);
		try {
			if (frames.length > 0) {
				frames[frames.length - 1].focus();
			} else {
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
		if (this.overlapRoot === element) {
			this.setPositionMode!('center');
		}
	}
};

Window.closeAll = function (this: any) {
	const frames = this.frames;
	let i = frames.length;
	while (--i >= 0) {
		const frame = frames[i];
		const enabled = (frame as any).closeEventEnabled;
		frame.closeEventEnabled = false;
		this.close!(frame.id);
		frame.closeEventEnabled = enabled;
	}
};

Window.isWindowOpen = function (this: any, id) {
	for (const frame of this.frames) {
		if (frame.id === id) return true;
	}
	return false;
};

Window.getTopWindow = function (this: any) {
	const { frames } = this;
	if (frames.length !== 0) {
		return frames[frames.length - 1];
	}
	return undefined;
};

Window.setPositionMode = function (this: any, mode: string) {
	if (this.positionMode !== mode) {
		if (this.overlapRoot) {
			this.overlapRoot = null;
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
				this.overlapRoot = frames[length - 1];
				break;
			}
		}
		this.positionMode = mode;
	}
};

Window.saveActiveElement = function (this: any) {
	const { activeElement } = document;
	if (activeElement !== document.body) {
		this.activeElement = activeElement;
		this.activeElement.blur();
	}
};

Window.restoreActiveElement = function (this: any) {
	if (this.activeElement) {
		// preventScroll 防止 focus 触发浏览器滚动（body overflow hidden 下 scrollY 变化会把顶栏滚出视口）
		this.activeElement.focus({ preventScroll: true });
		this.activeElement = null;
	}
};

Window.refocus = function (this: any) {
	const active = document.activeElement;
	if (active !== document.body) {
		active!.blur();
		active!.focus();
	}
};

Window.confirm = (function IIFE() {
	return function (options: any, items: any) {
		const elWindow = $('#confirmation');
		const elMessage = $('#confirmation-message');
		const buttons = [
			$('#confirmation-button-0'),
			$('#confirmation-button-1'),
			$('#confirmation-button-2')
		];
		const message = options.message ?? '';
		const click = function (this: any, event: any) {
			Window.close!('confirmation');
			const index = buttons.indexOf(this);
			const item = items[index];
			item.click?.();
		};
		for (let i = 0; i < buttons.length; i++) {
			const button = buttons[i];
			const item = items[i];
			if (item) {
				button.textContent = item.label;
				button.addEventListener('click', click);
				show(button);
			} else {
				hide(button);
			}
		}
		if (items.length > 0) {
			getFocus(buttons[0]);
		}
		elMessage.textContent = message;
		elWindow.addEventListener(
			'closed',
			(event: Event) => {
				for (const button of buttons) {
					button.removeEventListener('click', click);
				}
				options.close?.();
			},
			{ once: true }
		);

		const measure = measureText(message);
		const textWidth = measure.width;
		const textHeight = measure.lines * 20;
		const buttonWidth = items.length * 98 - 10;
		const contentWidth = Math.max(textWidth, buttonWidth) + 20;
		const contentHeight = textHeight + 50;
		elWindow.style.width = `${contentWidth}px`;
		elWindow.style.height = `${contentHeight + 24}px`;
		Window.open!('confirmation');
	};
})();

Window.keydown = function (this: any, event) {
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

Window.cancel = function (this: any, event) {
	let element = event.target.parentNode;
	while (element) {
		if ((element as HTMLElement).classList.contains('window-frame')) {
			return Window.close!(element.id);
		} else {
			element = element.parentNode;
		}
	}
};

Window.ambient.update = function (this: any) {
	const frames = Window.frames;
	let i = frames.length;
	while (--i >= 0) {
		const frame = frames[i];
		if ((frame as any).enableAmbient) {
			addClass(this, 'open');
			this.style.zIndex = i + 1;
			return;
		}
	}
	removeClass(this, 'open');
};

(window as any).Window = Window;
