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

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { hasClass, rect } from '@/util/element-utils';

function getWindow() {
	return (window as any).Window;
}

interface TitleBarElement extends HTMLDivElement {
	dragging: PointerEvent | null;
	pointerdown(event: PointerEvent): void;
	mouseclick(event: Event): void;
	doubleclick(event: Event): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const root = ref<HTMLDivElement | null>(null);

let dragging: PointerEvent | null = null;

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
};

const pointerdown = (event: PointerEvent): void => {
	const element = root.value;
	if (!element || dragging) {
		return;
	}
	if (event.button !== 0 || event.target !== element) {
		return;
	}
	const windowFrame = element.parentNode as HTMLElement & {
		style: CSSStyleDeclaration;
	};
	if (!windowFrame || !(windowFrame instanceof HTMLElement)) {
		return;
	}
	const { left, top, width, height } = rect(windowFrame);
	const startX = event.clientX;
	const startY = event.clientY;
	const pointermove = (event: PointerEvent): void => {
		if (dragging?.relate(event)) {
			let right = window.innerWidth - width;
			let bottom = window.innerHeight - height;
			if (hasClass(document.body, 'border')) {
				const dpx = 1 / window.devicePixelRatio;
				right -= dpx * 2;
				bottom -= dpx * 2;
			}
			const x = CSS.rasterize(left - startX + event.clientX);
			const y = CSS.rasterize(top - startY + event.clientY);
			windowFrame.style.left = `${Math.clamp(x, 0, right)}px`;
			windowFrame.style.top = `${Math.clamp(y, 0, bottom)}px`;
		}
	};
	const pointerup = (event: PointerEvent): void => {
		if (dragging?.relate(event)) {
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
		getWindow().close(windowFrame.id);
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
	const el = root.value as TitleBarElement | null;
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
