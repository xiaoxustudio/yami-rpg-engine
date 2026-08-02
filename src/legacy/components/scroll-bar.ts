import { on, off, addClass, removeClass, rect } from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';

interface ScrollThumb extends HTMLElement {
	left?: number;
	width?: number;
	top?: number;
	height?: number;
}

interface ScrollDragging extends PointerEvent {
	mode: 'scroll' | 'repeat';
	target: HTMLElement;
	scrollLeft: number;
	scrollTop: number;
	clientX: number;
	clientY: number;
	relate(event: PointerEvent): boolean;
}

interface ScrollBarElement extends HTMLElement {
	target: HTMLElement | null;
	type: string | null;
	thumb: ScrollThumb | null;
	timer: Timer | null;
	dragging: ScrollDragging | null;
	visible: boolean;
	bind(target: HTMLElement, type: string): void;
	updateHorizontalBar(): void;
	updateVerticalBar(): void;
	updateDisplay(state: boolean): void;
}

export function attachScrollBarApi(el: HTMLElement): void {
	const bar = el as ScrollBarElement;

	bar.target = null;
	bar.type = null;
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

	bar.updateDisplay = function (state: boolean): void {
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

	bar.updateHorizontalBar = function (): void {
		const target = bar.target!;
		const cw = target.clientWidth;
		const sw = target.scrollWidth;
		if (cw < sw) {
			const sl = target.scrollLeft;
			const p1 = Math.roundTo((sl / sw) * 100, 6);
			const p2 = Math.roundTo((cw / sw) * 100, 6);
			updateHorizontalThumb(p1, p2);
			bar.updateDisplay(true);
		} else {
			bar.updateDisplay(false);
		}
	};

	bar.updateVerticalBar = function (): void {
		const target = bar.target!;
		const ch = target.clientHeight;
		const sh = target.scrollHeight;
		if (ch < sh) {
			const st = target.scrollTop;
			const p1 = Math.roundTo((st / sh) * 100, 6);
			const p2 = Math.roundTo((ch / sh) * 100, 6);
			updateVerticalThumb(p1, p2);
			bar.updateDisplay(true);
		} else {
			bar.updateDisplay(false);
		}
	};

	bar.bind = function (target: HTMLElement, type: string): void {
		el.appendChild((bar.thumb = document.createElement('scroll-thumb') as ScrollThumb));
		bar.thumb.appendChild(document.createElement('scroll-thumb-inner'));
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

	const scrollRelative = (sign: number): void => {
		const { target } = bar;
		let { timer } = bar;
		if (!timer) {
			timer = bar.timer = new Timer({
				duration: 0,
				update: (timer: any) => {
					switch (timer.state) {
						case 'wait': {
							const { dragging } = bar;
							if (!dragging) {
								return false;
							}
							if (dragging!.target !== el) {
								break;
							}
							const type = bar.type;
							const r = rect(bar.thumb!);
							const offset = timer.offset;
							if (type === 'horizontal') {
								const { clientX } = dragging;
								const { left, right } = r;
								if (
									(offset < 0 && clientX < left) ||
									(offset > 0 && clientX > right)
								) {
								} else {
									break;
								}
							}
							if (type === 'vertical') {
								const { clientY } = dragging;
								const { top, bottom } = r;
								if (
									(offset < 0 && clientY < top) ||
									(offset > 0 && clientY > bottom)
								) {
								} else {
									break;
								}
							}
							timer.state = 'repeat';
							timer.elapsed = Timer.deltaTime;
							timer.duration = Math.abs(offset) / 5;
							timer.start = timer.end;
							timer.end += offset;
						}
						case 'first':
						case 'repeat': {
							const { elapsed, duration } = timer;
							const { start, end, offset } = timer;
							const time = elapsed / duration;
							const value = start * (1 - time) + end * time;
							let max = 0;
							switch (bar.type) {
								case 'horizontal':
									max = target!.scrollWidth - target!.clientWidth;
									target!.setScrollLeft(value);
									break;
								case 'vertical':
									max = target!.scrollHeight - target!.clientHeight;
									target!.setScrollTop(value);
									break;
							}
							if ((offset < 0 && value <= 0) || (offset > 0 && value >= max)) {
								return false;
							}
							break;
						}
						case 'delay':
							break;
					}
				},
				callback: (timer: any) => {
					if (bar.dragging) {
						switch (timer.state) {
							case 'first':
								timer.state = 'delay';
								timer.elapsed = 0;
								timer.duration = 100;
								return true;
							case 'delay':
							case 'repeat':
								timer.state = 'wait';
								timer.duration = Infinity;
								return true;
						}
					}
				}
			});
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
		timer.state = 'first';
		timer.elapsed = 0;
		timer.duration = Math.abs(offset) / 10;
		timer.start = start;
		timer.end = start + offset;
		timer.offset = offset;
		timer.add();
	};

	const windowPointerup = (event: PointerEvent): void => {
		const { dragging } = bar;
		if (dragging!.relate(event)) {
			switch (dragging!.mode) {
				case 'scroll':
					break;
				case 'repeat':
					break;
			}
			bar.dragging = null;
			off(window as any, 'pointerup', windowPointerup);
			off(window as any, 'pointermove', windowPointermove);
		}
	};

	const windowPointermove = (event: PointerEvent): void => {
		const { dragging } = bar;
		if (dragging!.relate(event)) {
			switch (dragging!.mode) {
				case 'scroll': {
					const target = bar.target!;
					switch (bar.type) {
						case 'horizontal':
							if (el.clientWidth !== 0) {
								target.setScrollLeft(
									dragging!.scrollLeft +
										((event.clientX - dragging!.clientX) * target.scrollWidth) /
											el.clientWidth
								);
							}
							break;
						case 'vertical':
							if (el.clientHeight !== 0) {
								target.setScrollTop(
									dragging!.scrollTop +
										((event.clientY - dragging!.clientY) *
											target.scrollHeight) /
											el.clientHeight
								);
							}
							break;
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
					on(window as any, 'pointerup', windowPointerup);
					on(window as any, 'pointermove', windowPointermove);
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
					on(window as any, 'pointerup', windowPointerup);
					on(window as any, 'pointermove', windowPointermove);
				}
				break;
		}
	};

	on(el, 'pointerdown', pointerdown);
}

export function createScrollBar(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'scroll-bar';
	attachScrollBarApi(el);
	return el;
}
