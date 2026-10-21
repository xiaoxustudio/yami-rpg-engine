<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clamp, hasClass, rect, rasterize, relate } from '../../../utils/dom';
import { attachApi } from '../../../utils/attach-api';
import { useEventListener } from '../../../composables/useEventListener';

function getWindow(): { close(id?: string): void } | undefined {
	const host: Window = window;
	return host.Window;
}

interface Props {
	id?: string;
}

const props = withDefaults(defineProps<Props>(), { id: '' });

const root = ref<HTMLDivElement | null>(null);

let dragging: PointerEvent | null = null;

/**
 * 本次拖拽的起始几何与目标窗口。**刻意是普通对象、不进响应式**——
 * 它装着 DOM 元素，proxy 化没有意义还可能出问题；需要响应式的只是「拖拽是否进行中」。
 */
let drag: {
	frame: HTMLElement;
	left: number;
	top: number;
	width: number;
	height: number;
	startX: number;
	startY: number;
} | null = null;

/** 拖拽中为真 —— 专供 `useEventListener` 的 `enabled`（见下方三个 window 监听）。 */
const dragActive = ref(false);

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
};

/**
 * 结束本次标题栏拖拽：清状态并让 `dragActive` 归假，三个 window 监听随之被摘除。
 *
 * 原先这三个监听是 `pointerdown` 里**每次拖拽现造的三个闭包**（各自捕获那一次的起始几何），
 * 并在 `cancel` 里逐条 `removeEventListener`。改为 setup 层的常驻处理器 + `enabled` 驱动，
 * 几何挪到 `drag` 里；`cancel` 的语义整个由 `endDrag` 承担。
 */
const endDrag = (): void => {
	dragging = null;
	drag = null;
	dragActive.value = false;
};

const dragPointermove = (event: Event): void => {
	const moveEvent = event as PointerEvent;
	const current = drag;
	if (!current || !dragging || !relate(dragging, moveEvent)) return;
	const { frame, left, top, width, height, startX, startY } = current;
	let right = window.innerWidth - width;
	let bottom = window.innerHeight - height;
	if (hasClass(document.body, 'border')) {
		const dpx = 1 / window.devicePixelRatio;
		right -= dpx * 2;
		bottom -= dpx * 2;
	}
	const x = rasterize(left - startX + moveEvent.clientX);
	const y = rasterize(top - startY + moveEvent.clientY);
	frame.style.left = `${clamp(x, 0, right)}px`;
	frame.style.top = `${clamp(y, 0, bottom)}px`;
};

const dragPointerup = (event: Event): void => {
	const upEvent = event as PointerEvent;
	if (dragging && relate(dragging, upEvent)) {
		endDrag();
	}
};

/**
 * 拖拽期才挂的三个 window 监听（`pointermove` 跟随、`pointerup` 收尾、`blur` 失焦即取消）。
 * `event as PointerEvent`：composable 的 handler 形参是宽松的 `Event`，而这三个事件名在 window 上
 * 必然是 PointerEvent / FocusEvent，用 cast 表达这层已知事实，不放宽 composable 签名。
 *
 * ⚠️ 挂载时机是 `flush: 'post'`：真实拖拽里 pointerdown 与随后的 pointermove 必然分属不同 task，
 * 不受影响；但**同一 tick 内连续派发这两个事件的测试需要先 `await nextTick()`**。
 */
useEventListener(window, 'pointermove', dragPointermove, { enabled: dragActive });
useEventListener(window, 'pointerup', dragPointerup, { enabled: dragActive });
useEventListener(window, 'blur', endDrag, { enabled: dragActive });

const pointerdown = (event: PointerEvent): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (dragging) {
		(dragging as PointerEvent & { cancel?(event?: Event): void }).cancel?.();
		dragging = null;
	}
	if (event.button !== 0 || !(event.target instanceof Node) || !element.contains(event.target)) {
		return;
	}
	const target = event.target as HTMLElement;
	if (hasClass(target, 'close') || hasClass(target, 'maximize') || hasClass(target, 'minimize')) {
		return;
	}
	const windowFrame = element.parentNode as HTMLElement;
	if (!windowFrame || !(windowFrame instanceof HTMLElement)) {
		return;
	}
	const { left, top, width, height } = rect(windowFrame);
	const startX = event.clientX;
	const startY = event.clientY;
	drag = { frame: windowFrame, left, top, width, height, startX, startY };
	dragging = event;
	(event as PointerEvent & { cancel(event?: Event): void }).cancel = endDrag;
	dragActive.value = true;
};

const mouseclick = (event: Event): void => {
	const target = event.target as HTMLElement;
	const windowFrame = root.value?.parentNode as HTMLElement & {
		hasClass(name: string): boolean;
		maximize(): void;
		unmaximize(): void;
		id: string;
	};
	if (!windowFrame || !(windowFrame instanceof HTMLElement)) {
		return;
	}
	if (hasClass(target, 'maximize')) {
		if (!hasClass(windowFrame, 'maximized')) {
			windowFrame.maximize();
		} else {
			windowFrame.unmaximize();
		}
	} else if (hasClass(target, 'close')) {
		getWindow()?.close(windowFrame.id);
	}
};

const doubleclick = (event: Event): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const target = event.target as HTMLElement;
	if (target === element && element.querySelector('.maximize')) {
		(dragging as (PointerEvent & { cancel(): void }) | null)?.cancel();
		const windowFrame = element.parentNode as HTMLElement & {
			hasClass(name: string): boolean;
			maximize(): void;
			unmaximize(): void;
		};
		if (!windowFrame || !(windowFrame instanceof HTMLElement)) {
			return;
		}
		if (!hasClass(windowFrame, 'maximized')) {
			windowFrame.maximize();
		} else {
			windowFrame.unmaximize();
		}
	}
};

defineExpose({ pointerdown, mouseclick, doubleclick, on, root });

onMounted(() => {
	const el = root.value as (HTMLDivElement & { [k: string]: unknown }) | null;
	if (!el) {
		return;
	}
	Object.defineProperty(el, 'dragging', {
		get: () => dragging,
		set: (value: PointerEvent | null) => {
			dragging = value;
		},
		configurable: true
	});
	attachApi(el, {
		pointerdown,
		mouseclick,
		doubleclick,
		on
	});
});
</script>

<template>
	<div
		ref="root"
		class="title-bar"
		:id="props.id"
		@pointerdown="pointerdown"
		@click="mouseclick"
		@dblclick="doubleclick"
	>
		<slot />
	</div>
</template>
