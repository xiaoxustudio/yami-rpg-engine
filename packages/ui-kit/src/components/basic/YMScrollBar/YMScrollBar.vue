<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { rect, relate, roundTo } from '../../../utils/dom';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const root = ref<HTMLElement | null>(null);
const thumb = ref<HTMLElement | null>(null);

interface ThumbElement extends HTMLElement {
	left?: number;
	width?: number;
	top?: number;
	height?: number;
}

interface ScrollBarRootElement extends HTMLElement {
	bind: (target: HTMLElement, type: string) => void;
	updateHorizontalBar: () => void;
	updateVerticalBar: () => void;
	updateDisplay: (value: boolean) => void;
}

type DragState = PointerEvent & {
	mode: 'scroll' | 'repeat';
	scrollLeft: number;
	scrollTop: number;
	clientX: number;
	clientY: number;
	relate?: (event: PointerEvent) => boolean;
};

const state = {
	target: null as HTMLElement | null,
	type: null as string | null,
	thumb: null as HTMLElement | null,
	dragging: null as DragState | null,
	visible: false,
	animFrame: null as number | null,
	animState: null as {
		type: string;
		target: HTMLElement;
		start: number;
		end: number;
		offset: number;
		elapsed: number;
		duration: number;
		phase: 'first' | 'repeat' | 'delay' | 'wait';
		_last: number;
	} | null
};

const updateHorizontalThumb = (left: number, width: number): void => {
	const thumb = state.thumb;
	if (!thumb) return;
	if ((thumb as ThumbElement).left !== left) {
		(thumb as ThumbElement).left = left;
		thumb.style.left = `${left}%`;
	}
	if ((thumb as ThumbElement).width !== width) {
		(thumb as ThumbElement).width = width;
		thumb.style.width = `${width}%`;
	}
};

const updateVerticalThumb = (top: number, height: number): void => {
	const thumb = state.thumb;
	if (!thumb) return;
	if ((thumb as ThumbElement).top !== top) {
		(thumb as ThumbElement).top = top;
		thumb.style.top = `${top}%`;
	}
	if ((thumb as ThumbElement).height !== height) {
		(thumb as ThumbElement).height = height;
		thumb.style.height = `${height}%`;
	}
};

const updateDisplay = (value: boolean): void => {
	const element = root.value;
	if (!element) return;
	if (state.visible !== value) {
		state.visible = value;
		element.classList.toggle('visible', value);
	}
};

const updateHorizontalBar = (): void => {
	const target = state.target;
	if (!target) return;
	const cw = target.clientWidth;
	const sw = target.scrollWidth;
	if (cw < sw) {
		const sl = target.scrollLeft;
		const p1 = roundTo((sl / sw) * 100, 6);
		const p2 = roundTo((cw / sw) * 100, 6);
		updateHorizontalThumb(p1, p2);
		updateDisplay(true);
	} else {
		updateDisplay(false);
	}
};

const updateVerticalBar = (): void => {
	const target = state.target;
	if (!target) return;
	const ch = target.clientHeight;
	const sh = target.scrollHeight;
	if (ch < sh) {
		const st = target.scrollTop;
		const p1 = roundTo((st / sh) * 100, 6);
		const p2 = roundTo((ch / sh) * 100, 6);
		updateVerticalThumb(p1, p2);
		updateDisplay(true);
	} else {
		updateDisplay(false);
	}
};

const bind = (target: HTMLElement, type: string): void => {
	const element = root.value;
	if (!element) return;
	state.target = target;
	state.type = type;
	const thumbEl = (state.thumb = thumb.value);
	element.classList.add(type);
	if (thumbEl) {
		switch (type) {
			case 'horizontal':
				thumbEl.style.height = '100%';
				break;
			case 'vertical':
				thumbEl.style.width = '100%';
				break;
		}
	}
	element.classList.add('visible');
	state.visible = true;
};

const stopAnimation = (): void => {
	if (state.animFrame !== null) {
		cancelAnimationFrame(state.animFrame);
		state.animFrame = null;
	}
	state.animState = null;
};

const scrollRelative = (sign: number): void => {
	const { target, type } = state;
	if (!target || !type) return;
	let start = 0;
	let offset = 0;
	switch (type) {
		case 'horizontal':
			start = target.scrollLeft;
			offset = target.clientWidth * sign;
			break;
		case 'vertical':
			start = target.scrollTop;
			offset = target.clientHeight * sign;
			break;
	}
	stopAnimation();
	const anim = (state.animState = {
		type,
		target,
		start,
		end: start + offset,
		offset,
		elapsed: 0,
		duration: Math.abs(offset) / 10,
		phase: 'first' as 'first' | 'repeat' | 'delay' | 'wait',
		_last: 0
	});
	const step = (now: number): void => {
		if (state.animState !== anim) return;
		const dt = anim.elapsed === 0 ? 0 : now - anim._last;
		anim._last = now;
		anim.elapsed += dt;
		const time = Math.min(anim.elapsed / anim.duration, 1);
		const value = anim.start * (1 - time) + anim.end * time;
		let max = 0;
		switch (anim.type) {
			case 'horizontal':
				max = anim.target.scrollWidth - anim.target.clientWidth;
				anim.target.scrollLeft = value;
				break;
			case 'vertical':
				max = anim.target.scrollHeight - anim.target.clientHeight;
				anim.target.scrollTop = value;
				break;
		}
		if ((anim.offset < 0 && value <= 0) || (anim.offset > 0 && value >= max)) {
			stopAnimation();
			return;
		}
		if (time < 1) {
			state.animFrame = requestAnimationFrame(step);
		} else if (anim.phase === 'first' && state.dragging) {
			// hold briefly then repeat while dragging outside the thumb
			anim.phase = 'delay';
			anim.elapsed = 0;
			anim.duration = 100;
			state.animFrame = requestAnimationFrame(step);
		} else if (anim.phase === 'delay' && state.dragging) {
			anim.phase = 'wait';
			state.animFrame = requestAnimationFrame(step);
		} else if (anim.phase === 'wait' && state.dragging) {
			// restart scroll in the same direction
			anim.elapsed = 0;
			anim.start = anim.end;
			anim.end += anim.offset;
			anim.duration = Math.abs(anim.offset) / 5;
			state.animFrame = requestAnimationFrame(step);
		} else {
			stopAnimation();
		}
	};
	anim._last = performance.now();
	state.animFrame = requestAnimationFrame(step);
};

const windowPointerup = (event: PointerEvent): void => {
	const { dragging } = state;
	if (dragging && dragging.relate?.(event)) {
		state.dragging = null;
		window.removeEventListener('pointerup', windowPointerup);
		window.removeEventListener('pointermove', windowPointermove);
	}
};

const windowPointermove = (event: PointerEvent): void => {
	const { dragging } = state;
	if (!dragging || !dragging.relate?.(event)) return;
	switch (dragging.mode) {
		case 'scroll': {
			const target = state.target;
			const element = root.value;
			if (!target || !element) break;
			switch (state.type) {
				case 'horizontal': {
					const denom =
						element.clientWidth > 0 ? element.clientWidth : target.clientWidth;
					if (denom > 0) {
						target.scrollLeft =
							dragging.scrollLeft +
							((event.clientX - dragging.clientX) * target.scrollWidth) / denom;
					}
					break;
				}
				case 'vertical': {
					const denom =
						element.clientHeight > 0 ? element.clientHeight : target.clientHeight;
					if (denom > 0) {
						target.scrollTop =
							dragging.scrollTop +
							((event.clientY - dragging.clientY) * target.scrollHeight) / denom;
					}
					break;
				}
			}
			break;
		}
		case 'repeat':
			state.dragging!.mode = 'repeat';
			break;
	}
};

const pointerdown = (event: PointerEvent): void => {
	if (state.dragging) return;
	if (event.button !== 0) return;
	const target = state.target;
	if (!target) return;
	target.focus();
	event.preventDefault();
	event.stopImmediatePropagation();
	const thumb = state.thumb;
	if (!thumb) return;
	if (event.target === thumb) {
		state.dragging = event as DragState;
		state.dragging.mode = 'scroll';
		state.dragging.scrollLeft = target.scrollLeft;
		state.dragging.scrollTop = target.scrollTop;
		state.dragging.relate = (e: PointerEvent) => relate(event, e);
		window.addEventListener('pointerup', windowPointerup);
		window.addEventListener('pointermove', windowPointermove);
	} else {
		const r = rect(thumb);
		switch (state.type) {
			case 'horizontal':
				scrollRelative(event.clientX < r.left ? -1 : 1);
				break;
			case 'vertical':
				scrollRelative(event.clientY < r.top ? -1 : 1);
				break;
		}
		state.dragging = event as DragState;
		state.dragging.mode = 'repeat';
		state.dragging.relate = (e: PointerEvent) => relate(event, e);
		window.addEventListener('pointerup', windowPointerup);
		window.addEventListener('pointermove', windowPointermove);
	}
};

onMounted(() => {
	const element = root.value as ScrollBarRootElement | null;
	if (!element) return;
	element.bind = bind;
	element.updateHorizontalBar = updateHorizontalBar;
	element.updateVerticalBar = updateVerticalBar;
	element.updateDisplay = updateDisplay;
});

onBeforeUnmount(() => {
	// 拖拽/滚动动画中途卸载：`windowPointerup` 只在自己跑到时才摘监听，卸载时不会；
	// 留着的话 `windowPointermove` 会继续打向已卸载的元素，动画帧也不会停。
	window.removeEventListener('pointerup', windowPointerup);
	window.removeEventListener('pointermove', windowPointermove);
	state.dragging = null;
	stopAnimation();
});

defineExpose({ bind, updateHorizontalBar, updateVerticalBar, updateDisplay, root });
</script>

<template>
	<div ref="root" class="scroll-bar" :id="props.id" @pointerdown="pointerdown">
		<div ref="thumb" class="scroll-thumb">
			<div class="scroll-thumb-inner"></div>
		</div>
	</div>
</template>

<style module>
:global(.scroll-bar) {
	display: none;
}

:global(.scroll-bar.visible) {
	display: block;
}

:global(.scroll-bar.horizontal) {
	position: absolute;
	bottom: 0;
	width: 100%;
	height: 12px;
}

:global(.scroll-bar.horizontal.with-corner) {
	width: calc(100% - 12px);
}

:global(.scroll-bar.vertical) {
	position: absolute;
	right: 0;
	width: 12px;
	height: 100%;
}

:global(.scroll-bar.vertical.with-corner) {
	height: calc(100% - 12px);
}

:global(.scroll-thumb) {
	position: absolute;
	opacity: 1;
	visibility: visible;
	transition-property: opacity, visibility;
	transition-delay: 0.4s;
	transition-duration: 0.8s;
}

:global(.scroll-bar:hover > .scroll-thumb),
:global(.scroll-bar:active > .scroll-thumb),
:global(.scroll-bar.dragging > .scroll-thumb) {
	transition-delay: 0s;
	transition-duration: 0.2s;
}

:global(.scroll-thumb-inner) {
	position: absolute;
	left: 1px;
	top: 1px;
	right: 1px;
	bottom: 1px;
	background-color: var(--custom-scrollbar-thumb-background);
	border: var(--custom-scrollbar-thumb-border);
	border-radius: 2px;
	pointer-events: none;
}

:global(.scroll-thumb:hover > .scroll-thumb-inner),
:global(.scroll-thumb:active > .scroll-thumb-inner) {
	background-color: var(--custom-scrollbar-thumb-background-hover);
}

:global(.scroll-corner) {
	display: none;
	position: absolute;
	right: 0;
	bottom: 0;
	width: 12px;
	height: 12px;
}

:global(.scroll-corner.visible) {
	display: block;
}
</style>
