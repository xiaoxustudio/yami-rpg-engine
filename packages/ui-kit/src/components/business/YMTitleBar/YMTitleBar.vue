<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { clamp, hasClass, rect, rasterize, relate } from '../../../utils/dom';

function getWindow(): { close(id?: string): void } | undefined {
	return (window as unknown as Window & { Window?: { close(id?: string): void } }).Window;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLDivElement | null>(null);

let dragging: PointerEvent | null = null;

const on = (
	type: string,
	listener: (event: Event) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
};

const pointerdown = (event: PointerEvent): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (dragging) {
		// 防模块级 dragging 残留（拖拽中 pointerup 丢失时阻断后续所有窗口拖拽）
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
	const pointermove = (moveEvent: PointerEvent): void => {
		if (dragging && relate(dragging, moveEvent)) {
			let right = window.innerWidth - width;
			let bottom = window.innerHeight - height;
			if (hasClass(document.body, 'border')) {
				const dpx = 1 / window.devicePixelRatio;
				right -= dpx * 2;
				bottom -= dpx * 2;
			}
			const x = rasterize(left - startX + moveEvent.clientX);
			const y = rasterize(top - startY + moveEvent.clientY);
			windowFrame.style.left = `${clamp(x, 0, right)}px`;
			windowFrame.style.top = `${clamp(y, 0, bottom)}px`;
		}
	};
	const pointerup = (upEvent: PointerEvent): void => {
		if (dragging && relate(dragging, upEvent)) {
			cancel();
		}
	};
	const cancel = (event?: Event): void => {
		dragging = null;
		window.removeEventListener('pointermove', pointermove);
		window.removeEventListener('pointerup', pointerup);
		window.removeEventListener('blur', cancel);
	};
	dragging = event;
	(event as PointerEvent & { cancel(event?: Event): void }).cancel = cancel;
	window.addEventListener('pointermove', pointermove);
	window.addEventListener('pointerup', pointerup);
	window.addEventListener('blur', cancel);
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
	el.pointerdown = pointerdown;
	el.mouseclick = mouseclick;
	el.doubleclick = doubleclick;
	el.on = on;
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

<style module>
:global(:where(.title-bar)) {
	display: block;
	position: relative;
	user-select: none;
	cursor: default;
}
</style>
