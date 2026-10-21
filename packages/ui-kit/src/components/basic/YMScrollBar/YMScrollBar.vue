<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { rect, relate, roundTo } from '../../../utils/dom';
import { useEventListener } from '../../../composables/useEventListener';

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const root = ref<HTMLElement | null>(null);
const thumb = ref<HTMLElement | null>(null);

/**
 * 拖拽是否进行中 —— **专门给 `useEventListener` 的 `enabled` 用的响应式信号**。
 *
 * 为什么不能直接用 `state.dragging`：`state` 是普通对象（不是 `reactive()`），
 * 对它的赋值不触发任何 watcher，`enabled` 永远不会重算。故这里另起一个 ref，
 * 与 `state.dragging` 在同样的两处同进同出（`pointerdown` 置真、`windowPointerup` 置假）。
 */
const draggingActive = ref(false);

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
			anim.phase = 'delay';
			anim.elapsed = 0;
			anim.duration = 100;
			state.animFrame = requestAnimationFrame(step);
		} else if (anim.phase === 'delay' && state.dragging) {
			anim.phase = 'wait';
			state.animFrame = requestAnimationFrame(step);
		} else if (anim.phase === 'wait' && state.dragging) {
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
		// 置假即摘掉 window 上那两个监听（见下方 useEventListener + enabled）
		draggingActive.value = false;
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

/**
 * 拖拽期才挂 window 的 `pointerup`/`pointermove`：用 `enabled` 由 `draggingActive` 驱动，
 * 挂/摘成对，不再在四处手工 add / remove。
 *
 * ⚠️ 开关必须响应式（见 `draggingActive` 的注释）；挂载时机是 `flush: 'post'`，
 * 因此**同一 tick 内连续派发 pointerdown → pointermove 的测试需要先 `await nextTick()`**。
 * 真实浏览器里 pointerdown 与随后的 pointermove/pointerup 本就分属不同 task，不受影响。
 *
 * 参数处 `event as PointerEvent`：`useEventListener` 的 handler 形参是宽松的 `Event`
 * （它不解析事件名字符串），而挂在 `window` 上的 `pointerup`/`pointermove` 必然是
 * PointerEvent —— 这个 cast 表达的就是这层已知事实，别为了它去放宽 composable 的签名。
 */
useEventListener(window, 'pointerup', (event) => windowPointerup(event as PointerEvent), {
	enabled: draggingActive
});
useEventListener(window, 'pointermove', (event) => windowPointermove(event as PointerEvent), {
	enabled: draggingActive
});

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
		draggingActive.value = true;
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
		draggingActive.value = true;
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
	// window 上的 pointerup / pointermove 由 useEventListener 随作用域销毁自动摘除
	state.dragging = null;
	draggingActive.value = false;
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
