export const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

export const addClass = (
	el: { classList?: DOMTokenList } | null | undefined,
	className: string
): boolean => {
	if (!el || !el.classList) return false;
	if (!el.classList.contains(className)) {
		el.classList.add(className);
		return true;
	}
	return false;
};

export const removeClass = (
	el: { classList?: DOMTokenList } | null | undefined,
	className: string
): boolean => {
	if (!el || !el.classList) return false;
	if (el.classList.contains(className)) {
		el.classList.remove(className);
		return true;
	}
	return false;
};

export const hasClass = (
	el: { classList?: DOMTokenList } | null | undefined,
	className: string
): boolean => !!el && !!el.classList && el.classList.contains(className);

export const hide = (el: HTMLElement | null | undefined): HTMLElement => {
	if (el) addClass(el, 'hidden');
	return el as HTMLElement;
};

export const show = (el: HTMLElement | null | undefined): HTMLElement => {
	if (el) removeClass(el, 'hidden');
	return el as HTMLElement;
};

export const seek = (el: EventTarget | null, tagName: string, count = 1): HTMLElement => {
	let element: HTMLElement = el as HTMLElement;
	const classMode = tagName.startsWith('.');
	const matches = (target: HTMLElement): boolean =>
		classMode ? hasClass(target, tagName.slice(1)) : target.tagName === tagName.toUpperCase();
	while (count-- > 0) {
		if (!matches(element) && element.parentNode instanceof HTMLElement) {
			element = element.parentNode;
			continue;
		}
		break;
	}
	return element;
};

export const css = (el: Element): CSSStyleDeclaration => getComputedStyle(el);

export const rect = (el: Node | null): DOMRect => (el as Element).getBoundingClientRect();

export const read = (
	el: HTMLElement | { read?: () => unknown; dataValue?: unknown } | null | undefined
): unknown => {
	if (el && 'read' in el && typeof el.read === 'function') {
		return el.read();
	}
	return el && 'dataValue' in el ? el.dataValue : undefined;
};

export const write = (
	el: HTMLElement | { write?: (value: unknown) => void; dataValue?: unknown } | null | undefined,
	value: unknown
): void => {
	if (el && 'write' in el && typeof el.write === 'function') {
		el.write(value);
	} else if (el && 'dataValue' in el) {
		(el as { dataValue: unknown }).dataValue = value;
	}
};

export const hasScrollBar = (el: HTMLElement): boolean =>
	el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

export const rasterize = (csspx: number): number => {
	const dpr = window.devicePixelRatio;
	return Math.round(csspx * dpr) / dpr;
};

export const relate = (a: PointerEvent, b: PointerEvent): boolean => a.pointerId === b.pointerId;

export const debounce = <T extends (...args: never[]) => void>(callback: T, delay: number): T => {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return ((...args: Parameters<T>) => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			timer = null;
			callback(...args);
		}, delay);
	}) as T;
};

export const getRelativeCoords = (
	event: PointerEvent,
	el: HTMLElement
): { x: number; y: number } => {
	const r = rect(el);
	return { x: event.clientX - r.left, y: event.clientY - r.top };
};

export const isInContent = (el: HTMLElement, event: PointerEvent): boolean => {
	const coords = getRelativeCoords(event, el);
	const x = coords.x - el.scrollLeft;
	const y = coords.y - el.scrollTop;
	return x >= 0 && x < el.clientWidth && y >= 0 && y < el.clientHeight;
};

const changeEvent = new Event('change');
export const dispatchChangeEvent = (
	el: { dispatchEvent: (event: Event) => unknown },
	_index = 0
): void => {
	el.dispatchEvent(changeEvent);
};

const updateEvent = new Event('update');
export const dispatchUpdateEvent = (el: { dispatchEvent: (event: Event) => unknown }): void => {
	el.dispatchEvent(updateEvent);
};

export const getWindowFramesLength = (): number => {
	const win = (window as Window & { Window?: { frames?: { length: number } } }).Window;
	return (win?.frames?.length ?? 0) + 1;
};

let lastDoubleclick: PointerEvent | null = null;

const doubleclickPointerdown = function (
	this: HTMLElement,
	event: PointerEvent & { cmdOrCtrlKey?: boolean; doubleclickProcessed?: boolean }
): void {
	if (
		!(event.ctrlKey || event.metaKey) &&
		!event.altKey &&
		!event.shiftKey &&
		!event.doubleclickProcessed
	) {
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
	listener: (event: PointerEvent) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	element.addEventListener('pointerdown', doubleclickPointerdown as unknown as EventListener);
	element.addEventListener('doubleclick', listener as EventListener, options);
};

export const macRedoKey = (e: KeyboardEvent): boolean =>
	typeof navigator !== 'undefined' && navigator.platform.includes('Mac')
		? e.metaKey && e.shiftKey && e.code === 'KeyZ'
		: false;

export const hideDragImage = (dt: DataTransfer | null): void => {
	if (dt) dt.setDragImage(new Image(), 0, 0);
};
