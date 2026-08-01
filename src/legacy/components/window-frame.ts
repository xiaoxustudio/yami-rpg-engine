import { on, off, addClass, removeClass, hasClass, rect } from '@/util/element-utils.ts';
import { TitleBar } from './title-bar.ts';
import { Layout } from '@/layout/layout.ts';

function getWindow() {
	return (window as any).Window;
}

export class WindowFrame extends HTMLElement {
	enableAmbient: boolean;
	activeElement: HTMLElement | null;
	focusableElements: HTMLElement[] | null;
	windowResize: ((event: Event) => void) | null;
	openEventEnabled: boolean;
	closeEventEnabled: boolean;
	closedEventEnabled: boolean;
	resizeEventEnabled: boolean;
	maximizeEventEnabled: boolean;
	unmaximizeEventEnabled: boolean;

	constructor() {
		super();

		this.enableAmbient = true;
		this.activeElement = null;
		this.focusableElements = null;
		this.windowResize = null;
		this.openEventEnabled = false;
		this.closeEventEnabled = false;
		this.closedEventEnabled = false;
		this.resizeEventEnabled = false;
		this.maximizeEventEnabled = false;
		this.unmaximizeEventEnabled = false;
	}

	open(): void {
		const W = getWindow();
		if (W.frames.append(this)) {
			W.ambient.update();
			addClass(this, 'open');
			this.computePosition();
			this.style.zIndex = String(W.frames?.length ?? 0);
			// 始终 dispatch 'open' 事件：旧版依赖 openEventEnabled 标志（由 on('open') 设置），但 settingconfig.ts 等模块在 constructor 期绑定事件时，#setting 元素可能尚未 升级为 WindowFrame 实例（customElements 升级异步），会调到 EventTarget.prototype.on 的 default 分支（addEventListener），openEventEnabled 未被置 true，dispatch 被跳过，导致窗口值加载回调不执行。始终 dispatch 可绕过升级时序问题。
			this.dispatchEvent(new Event('open'));
			if (this.resizeEventEnabled && hasClass(this, 'maximized')) {
				this.dispatchEvent(new Event('resize'));
				on(window as any, 'resize', this.windowResize!);
			}
		}
	}

	close(): boolean {
		if (
			this.closeEventEnabled &&
			!this.dispatchEvent(
				new Event('close', {
					cancelable: true
				})
			)
		) {
			return false;
		}
		if (getWindow().frames.remove(this)) {
			getWindow().ambient.update();
			removeClass(this, 'open');
			if (this.closedEventEnabled) {
				this.dispatchEvent(new Event('closed'));
			}
			if (this.resizeEventEnabled && hasClass(this, 'maximized')) {
				off(window as any, 'resize', this.windowResize!);
			}
			// 快捷键操作不会触发 blur
			if (document.activeElement !== document.body) {
				(document.activeElement as HTMLElement).blur();
			}
			return true;
		}
		return false;
	}

	maximize(): void {
		if (addClass(this, 'maximized')) {
			this.style.left = '0';
			this.style.top = '0';
			if (this.maximizeEventEnabled) {
				this.dispatchEvent(new Event('maximize'));
			}
			if (this.resizeEventEnabled) {
				this.dispatchEvent(new Event('resize'));
				on(window as any, 'resize', this.windowResize!);
			}
		}
	}

	unmaximize(): void {
		if (removeClass(this, 'maximized')) {
			this.computePosition();
			if (this.unmaximizeEventEnabled) {
				this.dispatchEvent(new Event('unmaximize'));
			}
			if (this.resizeEventEnabled) {
				this.dispatchEvent(new Event('resize'));
				off(window as any, 'resize', this.windowResize!);
			}
		}
	}

	focus(): void {
		if (removeClass(this, 'blur')) {
			removeClass(this, 'translucent');
			const elements = this.focusableElements;
			if (elements) {
				for (const element of elements) {
					element.tabIndex += 1;
				}
			}
			this.focusableElements = null;
			if (this.activeElement) {
				this.activeElement.focus();
				this.activeElement = null;
			}
		}
	}

	blur(): void {
		if (addClass(this, 'blur')) {
			if (!hasClass(this, 'opaque') && !hasClass(this, 'maximized')) {
				addClass(this, 'translucent');
			}
			const selector = Layout.focusableSelector as string;
			const elements = this.querySelectorAll(selector);
			for (const element of elements) {
				(element as HTMLElement).tabIndex -= 1;
			}
			this.focusableElements = Array.from(elements) as HTMLElement[];
			if (document.activeElement !== document.body) {
				this.activeElement = document.activeElement as HTMLElement;
				this.activeElement.blur();
			}
		}
	}

	computePosition(): void {
		const mode = this.getAttribute('mode');
		switch (mode ?? getWindow().positionMode) {
			case 'center':
				this.center();
				break;
			case 'absolute': {
				const pos = getWindow().absolutePos;
				this.absolute(pos.x, pos.y);
				break;
			}
			case 'overlap': {
				const frames = getWindow().frames;
				const parent = frames[frames.length - 2];
				this.overlap(parent);
				break;
			}
		}
	}

	center(): void {
		const r = rect(this);
		const x = CSS.rasterize((window.innerWidth - r.width) / 2);
		const y = CSS.rasterize((window.innerHeight - r.height) / 2);
		this.setPosition(x, y, r);
	}

	absolute(left: number, top: number): void {
		const r = rect(this);
		const x = CSS.rasterize(left);
		const y = CSS.rasterize(top);
		this.setPosition(x, y, r);
	}

	overlap(parent: WindowFrame): void {
		const r = rect(this);
		const { left, top } = parent.style;
		const x = CSS.rasterize(parseFloat(left) + 24);
		const y = CSS.rasterize(parseFloat(top) + 24);
		this.setPosition(x, y, r);
	}

	setPosition(x: number, y: number, rect: DOMRect): void {
		// 应用窗口带边框需要减去1px的margin
		if (hasClass(document.body, 'border')) {
			const dpx = 1 / window.devicePixelRatio;
			x -= dpx;
			y -= dpx;
		}
		const xMax = window.innerWidth - rect.width;
		const yMax = window.innerHeight - rect.height;
		this.style.left = `${Math.clamp(x, 0, xMax)}px`;
		this.style.top = `${Math.clamp(y, 0, yMax)}px`;
	}

	setTitle(text: string): void {
		const titleBar = this.firstElementChild;
		if (titleBar instanceof TitleBar) {
			for (const childNode of titleBar.childNodes) {
				if (childNode instanceof Text) {
					childNode.nodeValue = text;
					return;
				}
			}
		}
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'open':
				this.openEventEnabled = true;
				break;
			case 'close':
				this.closeEventEnabled = true;
				break;
			case 'closed':
				this.closedEventEnabled = true;
				break;
			case 'resize':
				this.resizeEventEnabled = true;
				this.windowResize = (event: Event) => {
					this.dispatchEvent(new Event('resize'));
				};
				break;
			case 'maximize':
				this.maximizeEventEnabled = true;
				break;
			case 'unmaximize':
				this.unmaximizeEventEnabled = true;
				break;
		}
	}
}

customElements.define('window-frame', WindowFrame);
