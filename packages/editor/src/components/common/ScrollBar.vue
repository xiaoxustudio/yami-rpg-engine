<template>
	<div class="scroll-bar" ref="root" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
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

const root = ref<HTMLElement | null>(null);

const state = {
	target: null as HTMLElement | null,
	type: null as string | null,
	thumb: null as ScrollThumb | null,
	timer: null as Timer | null,
	dragging: null as ScrollDragging | null,
	visible: false
};

const updateHorizontalThumb = (left: number, width: number): void => {
	const thumb = state.thumb!;
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
	const thumb = state.thumb!;
	if (thumb.top !== top) {
		thumb.top = top;
		thumb.style.top = `${top}%`;
	}
	if (thumb.height !== height) {
		thumb.height = height;
		thumb.style.height = `${height}%`;
	}
};

const updateDisplay = (value: boolean): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (state.visible !== value) {
		state.visible = value;
		switch (value) {
			case true:
				addClass(element, 'visible');
				break;
			case false:
				removeClass(element, 'visible');
				break;
		}
	}
};

const updateHorizontalBar = (): void => {
	const target = state.target!;
	const cw = target.clientWidth;
	const sw = target.scrollWidth;
	if (cw < sw) {
		const sl = target.scrollLeft;
		const p1 = Math.roundTo((sl / sw) * 100, 6);
		const p2 = Math.roundTo((cw / sw) * 100, 6);
		updateHorizontalThumb(p1, p2);
		updateDisplay(true);
	} else {
		updateDisplay(false);
	}
};

const updateVerticalBar = (): void => {
	const target = state.target!;
	const ch = target.clientHeight;
	const sh = target.scrollHeight;
	if (ch < sh) {
		const st = target.scrollTop;
		const p1 = Math.roundTo((st / sh) * 100, 6);
		const p2 = Math.roundTo((ch / sh) * 100, 6);
		updateVerticalThumb(p1, p2);
		updateDisplay(true);
	} else {
		updateDisplay(false);
	}
};

const bind = (target: HTMLElement, type: string): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	element.appendChild((state.thumb = document.createElement('scroll-thumb') as ScrollThumb));
	state.thumb.appendChild(document.createElement('scroll-thumb-inner'));
	state.target = target;
	state.type = type;
	addClass(element, type);
	switch (type) {
		case 'horizontal':
			state.thumb.style.height = '100%';
			break;
		case 'vertical':
			state.thumb.style.width = '100%';
			break;
	}
};

const scrollRelative = (sign: number): void => {
	const { target } = state;
	let { timer } = state;
	if (!timer) {
		timer = state.timer = new Timer({
			duration: 0,
			update: (timer: any) => {
				switch (timer.state) {
					case 'wait': {
						const { dragging } = state;
						if (!dragging) {
							return false;
						}
						if (dragging!.target !== root.value) {
							break;
						}
						const type = state.type;
						const r = rect(state.thumb!);
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
						let max: number;
						switch (state.type) {
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
				if (state.dragging) {
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
	let start: number;
	let offset: number;
	switch (state.type) {
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
	const { dragging } = state;
	if (dragging!.relate(event)) {
		switch (dragging!.mode) {
			case 'scroll':
				break;
			case 'repeat':
				break;
		}
		state.dragging = null;
		off(window as any, 'pointerup', windowPointerup);
		off(window as any, 'pointermove', windowPointermove);
	}
};

const windowPointermove = (event: PointerEvent): void => {
	const { dragging } = state;
	if (dragging!.relate(event)) {
		switch (dragging!.mode) {
			case 'scroll': {
				const target = state.target!;
				const element = root.value!;
				switch (state.type) {
					case 'horizontal':
						if (element.clientWidth !== 0) {
							target.setScrollLeft(
								dragging!.scrollLeft +
									((event.clientX - dragging!.clientX) * target.scrollWidth) /
										element.clientWidth
							);
						}
						break;
					case 'vertical':
						if (element.clientHeight !== 0) {
							target.setScrollTop(
								dragging!.scrollTop +
									((event.clientY - dragging!.clientY) * target.scrollHeight) /
										element.clientHeight
							);
						}
						break;
				}
				break;
			}
			case 'repeat':
				state.dragging = event as unknown as ScrollDragging;
				(event as unknown as ScrollDragging).mode = 'repeat';
				break;
		}
	}
};

const pointerdown = (event: PointerEvent): void => {
	if (state.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			state.target!.focus();
			event.preventDefault();
			event.stopImmediatePropagation();
			if (event.target === state.thumb) {
				state.dragging = event as unknown as ScrollDragging;
				(event as unknown as ScrollDragging).mode = 'scroll';
				(event as unknown as ScrollDragging).scrollLeft = state.target!.scrollLeft;
				(event as unknown as ScrollDragging).scrollTop = state.target!.scrollTop;
				on(window as any, 'pointerup', windowPointerup);
				on(window as any, 'pointermove', windowPointermove);
			} else {
				const r = rect(state.thumb!);
				switch (state.type) {
					case 'horizontal':
						scrollRelative(event.clientX < r.left ? -1 : 1);
						break;
					case 'vertical':
						scrollRelative(event.clientY < r.top ? -1 : 1);
						break;
				}
				state.dragging = event as unknown as ScrollDragging;
				(event as unknown as ScrollDragging).mode = 'repeat';
				on(window as any, 'pointerup', windowPointerup);
				on(window as any, 'pointermove', windowPointermove);
			}
			break;
	}
};

onMounted(() => {
	const element = root.value as any;
	if (!element) {
		return;
	}
	element.bind = bind;
	element.updateHorizontalBar = updateHorizontalBar;
	element.updateVerticalBar = updateVerticalBar;
	element.updateDisplay = updateDisplay;
	element.addEventListener('pointerdown', pointerdown);
});

defineExpose({ bind, updateHorizontalBar, updateVerticalBar, updateDisplay, root });
</script>
