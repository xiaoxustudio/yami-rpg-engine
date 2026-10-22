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

let drag: {
	frame: HTMLElement;
	left: number;
	top: number;
	width: number;
	height: number;
	startX: number;
	startY: number;
} | null = null;

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
 * 改为 setup 层的常驻处理器 + `enabled` 驱动，
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
