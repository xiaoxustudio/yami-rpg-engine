import { $ } from './dom.ts';
import { Timer } from './timer.ts';
import { Cursor } from '../tools/pointer-object.ts';

export function on(
	el: any,
	type: string,
	listener: (event: any) => void,
	options?: AddEventListenerOptions
): void {
	if (!el) {
		console.error('[on] el is null/undefined, type:', type, 'stack:', new Error().stack);
		return;
	}
	if (typeof (el as any).on === 'function') {
		(el as any).on(type, listener, options);
	} else {
		el.addEventListener(type, listener, options);
	}
}

export function off(
	el: any,
	type: string,
	listener: (event: any) => void,
	options?: EventListenerOptions
): void {
	if (!el) return;
	if (typeof (el as any).off === 'function') {
		(el as any).off(type, listener, options);
	} else {
		el.removeEventListener(type, listener, options);
	}
}

export function emit(el: any, type: string, detail?: any): boolean {
	return el.dispatchEvent(new CustomEvent(type, { detail }));
}

export function show(el: any): HTMLElement {
	if (!el) return el;
	removeClass(el, 'hidden');
	return el;
}

export function hide(el: any): HTMLElement {
	if (!el) return el;
	addClass(el, 'hidden');
	return el;
}

export function addClass(el: any, className: string): boolean {
	if (!el) return false;
	if (!el.classList) {
		console.error('[addClass] el has no classList:', el, 'stack:', new Error().stack);
		return false;
	}
	if (!el.classList.contains(className)) {
		el.classList.add(className);
		return true;
	}
	return false;
}

export function removeClass(el: any, className: string): boolean {
	if (!el) return false;
	if (!el.classList) {
		console.error('[removeClass] el has no classList:', el, 'stack:', new Error().stack);
		return false;
	}
	if (el.classList.contains(className)) {
		el.classList.remove(className);
		return true;
	}
	return false;
}

export function hasClass(el: any, className: string): boolean {
	return el.classList.contains(className);
}

export function enable(el: any): void {
	removeClass(el, 'disabled');
}

export function disable(el: any): void {
	addClass(el, 'disabled');
}

export function seek(el: any, tagName: string, count: number = 1): HTMLElement {
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
}

export function css(el: any): CSSStyleDeclaration {
	return getComputedStyle(el);
}

export function rect(el: any): DOMRect {
	return el.getBoundingClientRect();
}

export function clear(el: any): HTMLElement {
	if (!el) return el as HTMLElement;
	el.textContent = '';
	return el;
}

export function read(el: any): any {
	if (typeof (el as any).read === 'function') {
		return (el as any).read();
	}
	return (el as any).dataValue;
}

export function write(el: any, value: any): void {
	if (typeof (el as any).write === 'function') {
		(el as any).write(value);
	} else {
		(el as any).dataValue = value;
	}
}

export function getFocus(el: any, mode: string | null = null): void {
	setTimeout(() => {
		if (!el || typeof el.focus !== 'function') return;
		el.focus();
		switch (mode) {
			case 'all':
				if (typeof el.select === 'function') {
					el.select();
					el.scrollLeft = 0;
				}
				break;
			case 'end':
				if (typeof el.selectionStart === 'number') {
					const endIndex = el.value.length;
					el.selectionStart = endIndex;
					el.selectionEnd = endIndex;
				}
				break;
		}
	});
}

const resizeEvent = new Event('resize');
export function dispatchResizeEvent(el: any): void {
	el.dispatchEvent(resizeEvent);
}

export function focus(el: any): void {
	el.focus();
}

export function blur(el: any): void {
	el.blur();
}

export const setTooltip = (function IIFE() {
	const tooltip = $('#tooltip');
	const capture = { capture: true };
	let state: string = 'closed';
	let target: HTMLElement | null = null;
	let rect: DOMRect | null = null;
	let timeStamp: number = 0;
	let clientX: number = 0;
	let clientY: number = 0;
	const timer = new Timer({
		duration: 0,
		callback: () => {
			if (state === 'waiting') {
				let tip = (target as any)?.tip ?? '';
				if (!tip) {
					state = 'closed';
					window.off('keydown', close, capture);
					window.off('pointerdown', close, capture);
					return;
				}
				const hotkey = target?.getAttribute('hotkey');
				if (hotkey) {
					if (tip.includes('\n')) {
						tip = tip.replace('\n', ` (${hotkey})\n`);
					} else {
						tip += ` (${hotkey})`;
					}
				}
				state = 'open';
				addClass(tooltip, 'open');
				tooltip.innerHTML = tip;
				const { width, height } = tooltip.getBoundingClientRect();
				const right = window.innerWidth - width;
				const bottom = window.innerHeight - height;
				const x = Math.min(clientX + 10, right);
				const y = Math.min(clientY + 15, bottom);
				tooltip.style.left = `${x}px`;
				tooltip.style.top = `${y}px`;
				rect = tooltip.getBoundingClientRect();
			}
		}
	});

	const close = function (): void {
		switch (state) {
			case 'waiting':
			case 'open':
				state = 'closed';
				rect = null;
				timer.remove();
				removeClass(tooltip, 'open');
				window.off('keydown', close, capture);
				window.off('pointerdown', close, capture);
				break;
		}
	};

	const pointermove = function (this: HTMLElement, event: PointerEvent): void {
		if (timeStamp === event.timeStamp) {
			return;
		}
		timeStamp = event.timeStamp;
		switch (state) {
			case 'closed':
				if (target !== this) {
					state = 'waiting';
					target = this;
					timer.elapsed = 0;
					timer.duration = 250;
					timer.add();
					clientX = event.clientX;
					clientY = event.clientY;
					window.on('keydown', close, capture);
					window.on('pointerdown', close, capture);
				}
				break;
			case 'waiting':
				if (target === this) {
					timer.elapsed = 0;
					clientX = event.clientX;
					clientY = event.clientY;
				} else {
					close();
				}
				break;
			case 'open':
				if (target !== this) {
					close();
				}
				break;
		}
	};

	const pointerleave = function (this: HTMLElement, event: PointerEvent): void {
		if (
			!(event.relatedTarget instanceof HTMLElement && tooltip.contains(event.relatedTarget))
		) {
			target = null;
			close();
		}
	};

	tooltip.addEventListener('pointerleave', (event: PointerEvent) => {
		target = null;
		close();
	});

	return function (el: any, tip: string | (() => string)): void {
		if ('tip' in el === false) {
			el.addEventListener('pointermove', pointermove);
			el.addEventListener('pointerleave', pointerleave);
		}
		switch (typeof tip) {
			case 'string':
				el.tip = tip;
				break;
			case 'function':
				Object.defineProperty(el, 'tip', {
					configurable: true,
					get: tip as () => string
				});
				break;
		}
	};
})();

export function hideChildNodes(el: any): void {
	for (const childNode of el.childNodes) {
		hide(childNode as HTMLElement);
	}
}

export function showChildNodes(el: any): void {
	for (const childNode of el.childNodes) {
		show(childNode as HTMLElement);
	}
}

const changeEvents = [
	new Event('change', { bubbles: true }),
	new Event('change', { bubbles: true })
];
export function dispatchChangeEvent(el: any, index: number = 0): void {
	el.dispatchEvent(changeEvents[index]);
}

const updateEvent = new Event('update');
export function dispatchUpdateEvent(el: any): void {
	el.dispatchEvent(updateEvent);
}

export function hasScrollBar(el: any): boolean {
	return el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
}

export function isInContent(el: any, event: MouseEvent): boolean {
	const coords = event.getRelativeCoords(el);
	const x = coords.x - el.scrollLeft;
	const y = coords.y - el.scrollTop;
	return x >= 0 && x < el.clientWidth && y >= 0 && y < el.clientHeight;
}

export function addScrollbars(el: any): void {
	const hBar = document.createElement('scroll-bar');
	const vBar = document.createElement('scroll-bar');
	const corner = document.createElement('scroll-corner');
	const parent = el.parentNode as Node;
	const next = el.nextSibling;
	if (next) {
		parent.insertBefore(hBar, next);
		parent.insertBefore(vBar, next);
		parent.insertBefore(corner, next);
	} else {
		parent.appendChild(hBar);
		parent.appendChild(vBar);
		parent.appendChild(corner);
	}
	hBar.bind(el, 'horizontal');
	vBar.bind(el, 'vertical');

	const wheel = (event: WheelEvent) => {
		el.dispatchEvent(new WheelEvent('wheel', event));
	};
	on(hBar, 'wheel', wheel as (event: EditorEvent) => void);
	on(vBar, 'wheel', wheel as (event: EditorEvent) => void);
	on(corner, 'wheel', wheel as (event: EditorEvent) => void);

	const userscroll = new Event('userscroll');

	el.beginScrolling = function () {
		addClass(hBar, 'dragging');
		addClass(vBar, 'dragging');
	};

	el.endScrolling = function () {
		removeClass(hBar, 'dragging');
		removeClass(vBar, 'dragging');
	};

	el.setScroll = function (left: number, top: number) {
		const sl = el.scrollLeft;
		const st = el.scrollTop;
		el.scroll(left, top);
		if (el.scrollLeft !== sl || el.scrollTop !== st) {
			el.dispatchEvent(userscroll);
		}
	};

	el.setScrollLeft = function (left: number) {
		const sl = el.scrollLeft;
		el.scrollLeft = left;
		if (el.scrollLeft !== sl) {
			el.dispatchEvent(userscroll);
		}
	};

	el.setScrollTop = function (top: number) {
		const st = el.scrollTop;
		el.scrollTop = top;
		if (el.scrollTop !== st) {
			el.dispatchEvent(userscroll);
		}
	};

	let withCorner = false;
	el.updateScrollbars = function () {
		if (el.clientWidth < el.scrollWidth && el.clientHeight < el.scrollHeight) {
			if (!withCorner) {
				withCorner = true;
				addClass(hBar, 'with-corner');
				addClass(vBar, 'with-corner');
				addClass(corner, 'visible');
			}
		} else {
			if (withCorner) {
				withCorner = false;
				removeClass(hBar, 'with-corner');
				removeClass(vBar, 'with-corner');
				removeClass(corner, 'visible');
			}
		}
		hBar.updateHorizontalBar();
		vBar.updateVerticalBar();
	};
}

export function addSetScrollMethod(el: any): void {
	const userscroll = new Event('userscroll');

	el.setScroll = function (left: number, top: number) {
		const sl = el.scrollLeft;
		const st = el.scrollTop;
		el.scroll(left, top);
		if (el.scrollLeft !== sl || el.scrollTop !== st) {
			el.dispatchEvent(userscroll);
		}
	};
}

const defaultPointerdown = function (this: HTMLElement, event: EditorEvent) {
	if (this.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (event.altKey) {
				event.preventDefault();
				event.stopImmediatePropagation();
				this.dragging = event;
				event.mode = 'scroll';
				event.scrollLeft = this.scrollLeft;
				event.scrollTop = this.scrollTop;
				(Cursor.open as any)('cursor-grab');
				window.on('pointerup', this.scrollPointerup);
				window.on('pointermove', this.scrollPointermove);
			}
			break;
	}
};

const scrollPointerup = function (this: HTMLElement, event: EditorEvent) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'scroll':
				(Cursor.close as any)('cursor-grab');
				break;
		}
		this.dragging = null;
		window.off('pointerup', this.scrollPointerup);
		window.off('pointermove', this.scrollPointermove);
	}
};

const scrollPointermove = function (this: HTMLElement, event: EditorEvent) {
	const { dragging } = this;
	if (dragging.relate(event)) {
		switch (dragging.mode) {
			case 'scroll':
				this.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
				this.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
				break;
		}
	}
};

export function listenDraggingScrollbarEvent(
	el: any,
	pointerdown: (event: EditorEvent) => void = defaultPointerdown,
	options?: boolean | AddEventListenerOptions
): void {
	el.scrollPointerup = scrollPointerup.bind(el);
	el.scrollPointermove = scrollPointermove.bind(el);
	on(el, 'pointerdown', pointerdown, options as AddEventListenerOptions);
}
