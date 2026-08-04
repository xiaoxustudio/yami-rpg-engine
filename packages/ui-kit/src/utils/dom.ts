export const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

export const addClass = (el: any, className: string): boolean => {
	if (!el || !el.classList) return false;
	if (!el.classList.contains(className)) {
		el.classList.add(className);
		return true;
	}
	return false;
};

export const removeClass = (el: any, className: string): boolean => {
	if (!el || !el.classList) return false;
	if (el.classList.contains(className)) {
		el.classList.remove(className);
		return true;
	}
	return false;
};

export const hasClass = (el: any, className: string): boolean =>
	!!el && !!el.classList && el.classList.contains(className);

export const hide = (el: any): HTMLElement => {
	if (el) addClass(el, 'hidden');
	return el;
};

export const show = (el: any): HTMLElement => {
	if (el) removeClass(el, 'hidden');
	return el;
};

export const seek = (el: any, tagName: string, count = 1): HTMLElement => {
	let element: HTMLElement = el;
	while (count-- > 0) {
		if (
			element.tagName !== tagName.toUpperCase() &&
			element.parentNode instanceof HTMLElement
		) {
			element = element.parentNode;
			continue;
		}
		break;
	}
	return element;
};

export const css = (el: any): CSSStyleDeclaration => getComputedStyle(el);

export const rect = (el: any): DOMRect => el.getBoundingClientRect();

export const read = (el: any): any => {
	if (typeof (el as any).read === 'function') {
		return (el as any).read();
	}
	return (el as any).dataValue;
};

export const hasScrollBar = (el: any): boolean =>
	el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

export const rasterize = (csspx: number): number => {
	const dpr = window.devicePixelRatio;
	return Math.round(csspx * dpr) / dpr;
};

export const relate = (a: PointerEvent, b: PointerEvent): boolean => a.pointerId === b.pointerId;

export const debounce = <T extends (...args: any[]) => void>(callback: T, delay: number): T => {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return ((...args: any[]) => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			timer = null;
			callback(...args);
		}, delay);
	}) as T;
};

export const getRelativeCoords = (event: PointerEvent, el: any): { x: number; y: number } => {
	const r = rect(el);
	return { x: event.clientX - r.left, y: event.clientY - r.top };
};

export const isInContent = (el: any, event: PointerEvent): boolean => {
	const coords = getRelativeCoords(event, el);
	const x = coords.x - el.scrollLeft;
	const y = coords.y - el.scrollTop;
	return x >= 0 && x < el.clientWidth && y >= 0 && y < el.clientHeight;
};

const changeEvent = new Event('change');
export const dispatchChangeEvent = (el: any, index = 0): void => {
	el.dispatchEvent(changeEvent);
};

const updateEvent = new Event('update');
export const dispatchUpdateEvent = (el: any): void => {
	el.dispatchEvent(updateEvent);
};

export const getWindowFramesLength = (): number => {
	const win = (window as any).Window;
	return (win?.frames?.length ?? 0) + 1;
};

let lastDoubleclick: PointerEvent | null = null;

const doubleclickPointerdown = function (
	this: any,
	event: PointerEvent & { cmdOrCtrlKey?: boolean; doubleclickProcessed?: boolean }
): void {
	if (!event.cmdOrCtrlKey && !event.altKey && !event.shiftKey && !event.doubleclickProcessed) {
		event.doubleclickProcessed = true;
		switch (event.button) {
			case 0:
				if (
					lastDoubleclick !== null &&
					event.target === lastDoubleclick.target &&
					event.timeStamp - lastDoubleclick.timeStamp < 500 &&
					Math.abs(event.clientX - lastDoubleclick.clientX) < 4 &&
					Math.abs(event.clientY - lastDoubleclick.clientY) < 4 &&
					isInContent(this, event)
				) {
					if (!event.target!.dispatchEvent(new PointerEvent('doubleclick', event))) {
						event.preventDefault();
					}
					lastDoubleclick = null;
				} else {
					lastDoubleclick = event;
				}
				break;
			default:
				lastDoubleclick = null;
				break;
		}
	}
};

export const attachDoubleclick = (
	element: EventTarget,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	element.addEventListener('pointerdown', doubleclickPointerdown as any);
	element.addEventListener('doubleclick', listener, options);
};
