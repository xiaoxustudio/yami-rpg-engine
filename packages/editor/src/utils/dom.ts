export function addClass(el: HTMLElement, className: string): boolean {
	if (!el.classList.contains(className)) {
		el.classList.add(className);
		return true;
	}
	return false;
}

export function removeClass(el: HTMLElement, className: string): boolean {
	if (el.classList.contains(className)) {
		el.classList.remove(className);
		return true;
	}
	return false;
}

export function hasClass(el: HTMLElement, className: string): boolean {
	return el.classList.contains(className);
}

export function show(el: HTMLElement): void {
	el.style.display = '';
}

export function hide(el: HTMLElement): void {
	el.style.display = 'none';
}

export function css(el: HTMLElement, property: string): string;
export function css(el: HTMLElement, property: string, value: string): void;
export function css(el: HTMLElement, properties: Record<string, string>): void;
export function css(
	el: HTMLElement,
	...args: [string] | [string, string] | [Record<string, string>]
): string | void {
	if (args.length === 1) {
		return (getComputedStyle(el as Element) as unknown as Record<string, string>)[
			args[0] as string
		];
	}
	if (args.length === 2) {
		(el.style as unknown as Record<string, string>)[args[0] as string] = args[1] as string;
		return;
	}
	if (typeof args[0] === 'object' && args[0] !== null) {
		const props = args[0] as Record<string, string>;
		for (const key in props) {
			(el.style as unknown as Record<string, string>)[key] = props[key];
		}
	}
}

export function rect(el: HTMLElement): DOMRect {
	return el.getBoundingClientRect();
}

export function on(
	el: EventTarget,
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void {
	el.addEventListener(type, listener as EventListener, options);
}

export function off(
	el: EventTarget,
	type: string,
	listener: (event: Event) => void,
	options?: boolean | EventListenerOptions
): void {
	el.removeEventListener(type, listener as EventListener, options);
}

export function dispatchResizeEvent(el: HTMLElement): void {
	el.dispatchEvent(new Event('resize', { bubbles: false }));
}

export function dispatchChangeEvent(el: HTMLElement, index?: number): void {
	const event = new Event('change', { bubbles: true }) as Event & { index: number };
	if (index !== undefined) {
		event.index = index;
	}
	el.dispatchEvent(event);
}

export const measureText = (function IIFE() {
	const size = { width: 0, lines: 0 };
	const container = document.createElement('div');
	container.classList.add('text');
	let appended = false;
	let usedFont = '';
	let lineHeight = 0;
	container.style.whiteSpace = 'pre';
	const cache = new Map<string, { width: number; lines: number }>();
	const MAX_CACHE = 4096;
	const MAX_CACHE_TEXT = 256;
	return function (text: string, font = ''): { width: number; lines: number } {
		const cacheable = text.length <= MAX_CACHE_TEXT;
		const key = font + ' ' + text;
		const cached = cacheable ? cache.get(key) : undefined;
		if (cached) {
			size.width = cached.width;
			size.lines = cached.lines;
			return size;
		}
		if (appended === false) {
			appended = true;
			document.body.appendChild(container);
			container.textContent = 'a';
			lineHeight = container.offsetHeight;
			void Promise.resolve().then(() => {
				appended = false;
				container.textContent = '';
				container.remove();
			});
		}
		if (usedFont !== font) {
			usedFont = font;
			container.style.fontFamily = font ?? '';
		}
		container.textContent = text;
		size.width = container.offsetWidth;
		size.lines = container.offsetHeight / lineHeight;
		if (cacheable) {
			if (cache.size >= MAX_CACHE) cache.clear();
			cache.set(key, { width: size.width, lines: size.lines });
		}
		return size;
	};
})();

export const request = (function IIFE() {
	const callbacks: (() => void)[] = [];
	return function (callback: () => void): void {
		if (callbacks.append(callback)) {
			requestAnimationFrame(() => {
				if (callbacks.remove(callback)) {
					callback();
				}
			});
		}
	};
})();

function $(selector: `#${string}`): HTMLElement;
function $(selector: string): NodeListOf<HTMLElement>;
function $(selector: string): HTMLElement | NodeListOf<HTMLElement> {
	const regexp = /^#(\w|-)+$/;
	if (regexp.test(selector)) {
		return document.querySelector(selector) as HTMLElement;
	} else {
		return document.querySelectorAll(selector) as unknown as NodeListOf<HTMLElement>;
	}
}
export { $ };

export const getElementReader = function (prefix: string) {
	// oxlint-disable-next-line no-explicit-any
	return function (suffix: string): any {
		const element = $(`#${prefix}-${suffix}`) as HTMLElement & { read?: () => unknown };
		if (!element) {
			console.warn(`[reader] element not found: #${prefix}-${suffix}`);
			return undefined;
		}
		return typeof element.read === 'function' ? element.read() : undefined;
	};
};

export const getElementWriter = function (prefix: string, bindingObject?: Record<string, unknown>) {
	return function (suffix: string | number, value?: unknown): void {
		if (value === undefined) {
			const nodes = typeof suffix === 'string' ? suffix.split('-') : [suffix];
			value = bindingObject;
			for (const node of nodes) {
				value = (value as Record<string, unknown>)[node];
			}
		}
		const element: HTMLElement = $(`#${prefix}-${suffix}`);
		if (!element) {
			console.warn(`[writer] element not found: #${prefix}-${suffix}`);
			return;
		}
		if (typeof element.write === 'function') {
			element.write(value);
		} else {
			console.warn(`[writer] element has no write(): #${prefix}-${suffix}`);
		}
	};
};
