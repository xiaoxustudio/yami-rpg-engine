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
export function css(el: HTMLElement, ...args: any[]): any {
	if (args.length === 1) {
		return (getComputedStyle(el as Element) as any)[args[0] as string];
	}
	if (args.length === 2) {
		(el.style as any)[args[0] as string] = args[1] as string;
		return;
	}
	if (typeof args[0] === 'object' && args[0] !== null) {
		const props = args[0] as Record<string, string>;
		for (const key in props) {
			(el.style as any)[key] = props[key];
		}
	}
}

export function rect(el: HTMLElement): DOMRect {
	return el.getBoundingClientRect();
}

export function on(
	el: EventTarget,
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void {
	el.addEventListener(type, listener as EventListener, options);
}

export function off(
	el: EventTarget,
	type: string,
	listener: (event: any) => void,
	options?: boolean | EventListenerOptions
): void {
	el.removeEventListener(type, listener as EventListener, options);
}

export function dispatchResizeEvent(el: HTMLElement): void {
	el.dispatchEvent(new Event('resize', { bubbles: false }));
}

export function dispatchChangeEvent(el: HTMLElement, index?: number): void {
	const event = new Event('change', { bubbles: true }) as any;
	if (index !== undefined) {
		event.index = index;
	}
	el.dispatchEvent(event);
}
