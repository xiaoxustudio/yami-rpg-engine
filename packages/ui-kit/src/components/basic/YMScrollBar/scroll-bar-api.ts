/* oxlint-disable eslint/no-restricted-properties */
import { attachApi } from '../../../utils/attach-api';
import { addClass, removeClass, rect } from '../../../utils/dom';

export interface ScrollBarApiOptions {
	target?: HTMLElement | null;
	type?: 'horizontal' | 'vertical' | null;
}

export interface ScrollThumb extends HTMLElement {
	left: number;
	top: number;
	width: number;
	height: number;
}

interface ScrollDragging extends PointerEvent {
	mode: 'scroll' | 'repeat';
	target: HTMLElement;
	scrollLeft: number;
	scrollTop: number;
	clientX: number;
	clientY: number;
	relate(...args: unknown[]): boolean;
}

interface ScrollTimer {
	state: {
		name: string;
		elapsed: number;
		duration: number;
		start: number;
		end: number;
		offset: number;
	};
	add(): void;
	remove(): void;
}

export interface ScrollBarApi extends HTMLElement {
	target: HTMLElement | null;
	type: string | null;
	thumb: ScrollThumb | null;
	timer: ScrollTimer | null;
	dragging: ScrollDragging | null;
	visible: boolean;
	_initialized: boolean;
	bind(target: HTMLElement, type: string): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	updateDisplay(state: boolean): void;
}

const roundTo = (value: number, decimals: number): number => {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
};

const relate = (a: PointerEvent, b: PointerEvent): boolean => a.pointerId === b.pointerId;

export function attachScrollBarApi(
	el: HTMLElement,
	options: ScrollBarApiOptions = {}
): ScrollBarApi {
	const bar = el as ScrollBarApi;
	if (bar._initialized) return bar;

	bar.target = options.target ?? null;
	bar.type = options.type ?? null;
	bar.thumb = null;
	bar.timer = null;
	bar.dragging = null;
	bar.visible = false;

	const updateHorizontalThumb = (left: number, width: number): void => {
		const thumb = bar.thumb!;
		if (thumb.left !== left) {
			thumb.left = left;
			thumb.style.left = `${left}%`;
		}
		if (thumb.width !== width) {
			thumb.width = width;
			thumb.style.width = `${width}%`;
		}
	};

	const updateVerticalThumb = (top: number, height: number): void => {
		const thumb = bar.thumb!;
		if (thumb.top !== top) {
			thumb.top = top;
			thumb.style.top = `${top}%`;
		}
		if (thumb.height !== height) {
			thumb.height = height;
			thumb.style.height = `${height}%`;
		}
	};

	const updateDisplay = function (state: boolean): void {
		if (bar.visible !== state) {
			bar.visible = state;
			switch (state) {
				case true:
					addClass(el, 'visible');
					break;
				case false:
					removeClass(el, 'visible');
					break;
			}
		}
	};

	const updateHorizontalBar = function (): void {
		const target = bar.target!;
		const cw = target.clientWidth;
		const sw = target.scrollWidth;
		if (cw < sw) {
			const sl = target.scrollLeft;
			const p1 = roundTo((sl / sw) * 100, 6);
			const p2 = roundTo((cw / sw) * 100, 6);
			updateHorizontalThumb(p1, p2);
			bar.updateDisplay(true);
		} else {
			bar.updateDisplay(false);
		}
	};

	const updateVerticalBar = function (): void {
		const target = bar.target!;
		const ch = target.clientHeight;
		const sh = target.scrollHeight;
		if (ch < sh) {
			const st = target.scrollTop;
			const p1 = roundTo((st / sh) * 100, 6);
			const p2 = roundTo((ch / sh) * 100, 6);
			updateVerticalThumb(p1, p2);
			bar.updateDisplay(true);
		} else {
			bar.updateDisplay(false);
		}
	};

	const bind = function (target: HTMLElement, type: string): void {
		const thumb = document.createElement('div');
		addClass(thumb, 'scroll-thumb');
		const inner = document.createElement('div');
		addClass(inner, 'scroll-thumb-inner');
		thumb.appendChild(inner);
		el.appendChild((bar.thumb = thumb as unknown as ScrollThumb));
		bar.target = target;
		bar.type = type;
		addClass(el, type);
		switch (type) {
			case 'horizontal':
				bar.thumb.style.height = '100%';
				break;
			case 'vertical':
				bar.thumb.style.width = '100%';
				break;
		}
	};

	attachApi(bar, { updateDisplay, updateHorizontalBar, updateVerticalBar, bind });

	const scrollRelative = (sign: number): void => {
		const { target } = bar;
		let { timer } = bar;
		if (!timer) {
			let rafId: number | null = null;
			let cancelled = false;
			const state = {
				name: 'wait' as string,
				elapsed: 0,
				duration: 0,
				start: 0,
				end: 0,
				offset: 0
			};
			const step = (): void => {
				if (cancelled) return;
				rafId = requestAnimationFrame(step);
				switch (state.name) {
					case 'wait': {
						const { dragging } = bar;
						if (!dragging || dragging.target !== el) {
							return;
						}
						const type = bar.type;
						const r = rect(bar.thumb!);
						const offset = state.offset;
						if (type === 'horizontal') {
							const { clientX } = dragging;
							const { left, right } = r;
							if (
								!((offset < 0 && clientX < left) || (offset > 0 && clientX > right))
							) {
								return;
							}
						}
						if (type === 'vertical') {
							const { clientY } = dragging;
							const { top, bottom } = r;
							if (
								!((offset < 0 && clientY < top) || (offset > 0 && clientY > bottom))
							) {
								return;
							}
						}
						state.name = 'repeat';
						state.elapsed = 16;
						state.duration = Math.abs(offset) / 5;
						state.start = state.end;
						state.end += offset;
						break;
					}
					case 'first':
					case 'repeat': {
						const { elapsed, duration } = state;
						const { start, end, offset } = state;
						const time = duration === 0 ? 1 : elapsed / duration;
						const value = start * (1 - time) + end * time;
						let max = 0;
						switch (bar.type) {
							case 'horizontal':
								max = target!.scrollWidth - target!.clientWidth;
								target!.scrollLeft = value;
								break;
							case 'vertical':
								max = target!.scrollHeight - target!.clientHeight;
								target!.scrollTop = value;
								break;
						}
						if ((offset < 0 && value <= 0) || (offset > 0 && value >= max)) {
							state.name = 'wait';
							state.duration = Infinity;
							return;
						}
						state.elapsed += 16;
						break;
					}
				}
			};
			bar.timer = {
				state,
				add: () => {
					if (rafId === null) {
						rafId = requestAnimationFrame(step);
					}
				},
				remove: () => {
					cancelled = true;
					if (rafId !== null) {
						cancelAnimationFrame(rafId);
						rafId = null;
					}
				}
			};
			timer = bar.timer;
		}
		let start = 0;
		let offset = 0;
		switch (bar.type) {
			case 'horizontal':
				start = target!.scrollLeft;
				offset = target!.clientWidth * sign;
				break;
			case 'vertical':
				start = target!.scrollTop;
				offset = target!.clientHeight * sign;
				break;
		}
		timer.state.name = 'first';
		timer.state.elapsed = 0;
		timer.state.duration = Math.abs(offset) / 10;
		timer.state.start = start;
		timer.state.end = start + offset;
		timer.state.offset = offset;
		timer.add();
	};

	const windowPointerup = (event: PointerEvent): void => {
		const { dragging } = bar;
		if (dragging!.relate(event)) {
			bar.dragging = null;
			window.removeEventListener('pointerup', windowPointerup, true);
			window.removeEventListener('pointermove', windowPointermove, true);
		}
	};

	const windowPointermove = (event: PointerEvent): void => {
		const { dragging } = bar;
		if (dragging!.relate(event)) {
			switch (dragging!.mode) {
				case 'scroll': {
					const target = bar.target!;
					switch (bar.type) {
						case 'horizontal': {
							const denom = el.clientWidth > 0 ? el.clientWidth : target.clientWidth;
							if (denom > 0) {
								target.scrollLeft =
									dragging!.scrollLeft +
									((event.clientX - dragging!.clientX) * target.scrollWidth) /
										denom;
								bar.updateHorizontalBar();
								target.dispatchEvent(new Event('userscroll'));
							}
							break;
						}
						case 'vertical': {
							const denom =
								el.clientHeight > 0 ? el.clientHeight : target.clientHeight;
							if (denom > 0) {
								target.scrollTop =
									dragging!.scrollTop +
									((event.clientY - dragging!.clientY) * target.scrollHeight) /
										denom;
								bar.updateVerticalBar();
								target.dispatchEvent(new Event('userscroll'));
							}
							break;
						}
					}
					break;
				}
				case 'repeat':
					bar.dragging = event as unknown as ScrollDragging;
					(event as unknown as ScrollDragging).mode = 'repeat';
					break;
			}
		}
	};

	const pointerdown = (event: PointerEvent): void => {
		if (bar.dragging) {
			return;
		}
		switch (event.button) {
			case 0:
				bar.target!.focus();
				event.preventDefault();
				event.stopImmediatePropagation();
				if (event.target === bar.thumb) {
					bar.dragging = event as unknown as ScrollDragging;
					(event as unknown as ScrollDragging).mode = 'scroll';
					(event as unknown as ScrollDragging).scrollLeft = bar.target!.scrollLeft;
					(event as unknown as ScrollDragging).scrollTop = bar.target!.scrollTop;
					(event as unknown as ScrollDragging).relate = (e: PointerEvent) =>
						relate(event, e);
					window.addEventListener('pointerup', windowPointerup, true);
					window.addEventListener('pointermove', windowPointermove, true);
				} else {
					const r = rect(bar.thumb!);
					switch (bar.type) {
						case 'horizontal':
							scrollRelative(event.clientX < r.left ? -1 : 1);
							break;
						case 'vertical':
							scrollRelative(event.clientY < r.top ? -1 : 1);
							break;
					}
					bar.dragging = event as unknown as ScrollDragging;
					(event as unknown as ScrollDragging).mode = 'repeat';
					(event as unknown as ScrollDragging).relate = (e: PointerEvent) =>
						relate(event, e);
					window.addEventListener('pointerup', windowPointerup, true);
					window.addEventListener('pointermove', windowPointermove, true);
				}
				break;
		}
	};

	bar._initialized = true;
	el.addEventListener('pointerdown', pointerdown);

	return bar;
}

export function createScrollBarElement(options?: ScrollBarApiOptions): ScrollBarApi {
	const el = document.createElement('div');
	el.className = 'scroll-bar';
	return attachScrollBarApi(el, options);
}
