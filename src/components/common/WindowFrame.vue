<template>
	<div class="window-frame" ref="root" :id="props.id">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import { on as addEvent, off as removeEvent, addClass, removeClass, hasClass, rect } from '@/util/element-utils.ts';
import { Layout } from '@/layout/layout.ts';
import { Local } from '@/tools/localization.ts';

function getWindow() {
	return (window as any).Window;
}

interface Props {
	id?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	open: [];
	close: [];
	closed: [];
	resize: [];
	maximize: [];
	unmaximize: [];
}>();

const root = ref<HTMLElement | null>(null);

const state = reactive({
	enableAmbient: true,
	activeElement: null as HTMLElement | null,
	focusableElements: null as HTMLElement[] | null,
	windowResize: null as ((event: Event) => void) | null,
	openEventEnabled: false,
	closeEventEnabled: false,
	closedEventEnabled: false,
	resizeEventEnabled: false,
	maximizeEventEnabled: false,
	unmaximizeEventEnabled: false
});

const on = (
	type: string,
	listener: (event: any) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	root.value?.addEventListener(type, listener, options);
	switch (type) {
		case 'open':
			state.openEventEnabled = true;
			break;
		case 'close':
			state.closeEventEnabled = true;
			break;
		case 'closed':
			state.closedEventEnabled = true;
			break;
		case 'resize':
			state.resizeEventEnabled = true;
			state.windowResize = (event: Event) => {
				root.value?.dispatchEvent(new Event('resize'));
			};
			break;
		case 'maximize':
			state.maximizeEventEnabled = true;
			break;
		case 'unmaximize':
			state.unmaximizeEventEnabled = true;
			break;
	}
};

const computePosition = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const mode = element.getAttribute('mode');
	switch (mode ?? getWindow().positionMode) {
		case 'center':
			center();
			break;
		case 'absolute': {
			const pos = getWindow().absolutePos;
			absolute(pos.x, pos.y);
			break;
		}
		case 'overlap': {
			const frames = getWindow().frames;
			const parent = frames[frames.length - 2];
			overlap(parent);
			break;
		}
	}
};

const center = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const r = rect(element);
	const x = CSS.rasterize((window.innerWidth - r.width) / 2);
	const y = CSS.rasterize((window.innerHeight - r.height) / 2);
	setPosition(x, y, r);
};

const absolute = (left: number, top: number): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const r = rect(element);
	const x = CSS.rasterize(left);
	const y = CSS.rasterize(top);
	setPosition(x, y, r);
};

const overlap = (parent: HTMLElement): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const r = rect(element);
	const { left, top } = parent.style;
	const x = CSS.rasterize(parseFloat(left) + 24);
	const y = CSS.rasterize(parseFloat(top) + 24);
	setPosition(x, y, r);
};

const setPosition = (x: number, y: number, r: DOMRect): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (hasClass(document.body, 'border')) {
		const dpx = 1 / window.devicePixelRatio;
		x -= dpx;
		y -= dpx;
	}
	const xMax = window.innerWidth - r.width;
	const yMax = window.innerHeight - r.height;
	element.style.left = `${Math.clamp(x, 0, xMax)}px`;
	element.style.top = `${Math.clamp(y, 0, yMax)}px`;
};

const open = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const W = getWindow();
	if (W.frames.append(element)) {
		W.ambient.update();
		addClass(element, 'open');
		computePosition();
		element.style.zIndex = String(W.frames?.length ?? 0);
		element.dispatchEvent(new Event('open'));
		if (state.resizeEventEnabled && hasClass(element, 'maximized')) {
			element.dispatchEvent(new Event('resize'));
			addEvent(window as any, 'resize', state.windowResize!);
		}
	}
};

const close = (): boolean => {
	const element = root.value;
	if (!element) {
		return false;
	}
	if (
		state.closeEventEnabled &&
		!element.dispatchEvent(
			new Event('close', {
				cancelable: true
			})
		)
	) {
		return false;
	}
	if (getWindow().frames.remove(element)) {
		getWindow().ambient.update();
		removeClass(element, 'open');
		if (state.closedEventEnabled) {
			element.dispatchEvent(new Event('closed'));
		}
		if (state.resizeEventEnabled && hasClass(element, 'maximized')) {
			removeEvent(window as any, 'resize', state.windowResize!);
		}
		if (document.activeElement !== document.body) {
			(document.activeElement as HTMLElement).blur();
		}
		return true;
	}
	return false;
};

const maximize = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (addClass(element, 'maximized')) {
		element.style.left = '0';
		element.style.top = '0';
		if (state.maximizeEventEnabled) {
			element.dispatchEvent(new Event('maximize'));
		}
		if (state.resizeEventEnabled) {
			element.dispatchEvent(new Event('resize'));
			addEvent(window as any, 'resize', state.windowResize!);
		}
	}
};

const unmaximize = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (removeClass(element, 'maximized')) {
		computePosition();
		if (state.unmaximizeEventEnabled) {
			element.dispatchEvent(new Event('unmaximize'));
		}
		if (state.resizeEventEnabled) {
			element.dispatchEvent(new Event('resize'));
			removeEvent(window as any, 'resize', state.windowResize!);
		}
	}
};

const focus = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (removeClass(element, 'blur')) {
		removeClass(element, 'translucent');
		const elements = state.focusableElements;
		if (elements) {
			for (const el of elements) {
				el.tabIndex += 1;
			}
		}
		state.focusableElements = null;
		if (state.activeElement) {
			state.activeElement.focus();
			state.activeElement = null;
		}
	}
};

const blur = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	if (addClass(element, 'blur')) {
		if (!hasClass(element, 'opaque') && !hasClass(element, 'maximized')) {
			addClass(element, 'translucent');
		}
		const selector = Layout.focusableSelector as string;
		const elements = element.querySelectorAll(selector);
		for (const el of elements) {
			(el as HTMLElement).tabIndex -= 1;
		}
		state.focusableElements = Array.from(elements) as HTMLElement[];
		if (document.activeElement !== document.body) {
			state.activeElement = document.activeElement as HTMLElement;
			state.activeElement.blur();
		}
	}
};

const setTitle = (text: string): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const titleBar = element.firstElementChild;
	if (
		titleBar instanceof HTMLElement &&
		(titleBar.tagName === 'TITLE-BAR' || titleBar.classList.contains('title-bar'))
	) {
		for (const childNode of titleBar.childNodes) {
			if (childNode instanceof Text && (childNode.nodeValue ?? '').trim() !== '') {
				childNode.nodeValue = text;
				return;
			}
		}
	}
};

defineExpose({ open, close, maximize, unmaximize, focus, blur, setTitle, on, root });

const applyLocalization = (): void => {
	const element = root.value as any;
	if (!element) {
		return;
	}
	const apply = (el: any): void => {
		const item = Local.components?.[el?.id];
		if (item) {
			Local.setElement(el, item);
		}
	};
	apply(element);
	for (const el of element.querySelectorAll('[id]')) {
		apply(el);
	}
};

onMounted(() => {
	const element = root.value as any;
	if (!element) {
		return;
	}
	applyLocalization();
	window.addEventListener('localize', applyLocalization);
	element.open = open;
	element.close = close;
	element.maximize = maximize;
	element.unmaximize = unmaximize;
	element.focus = focus;
	element.blur = blur;
	element.setPosition = setPosition;
	element.setTitle = setTitle;
	element.on = on;
	Object.defineProperty(element, 'closeEventEnabled', {
		get: () => state.closeEventEnabled,
		set: (value: boolean) => {
			state.closeEventEnabled = value;
		},
		configurable: true
	});
	Object.defineProperty(element, 'enableAmbient', {
		get: () => state.enableAmbient,
		set: (value: boolean) => {
			state.enableAmbient = value;
		},
		configurable: true
	});
	Object.defineProperty(element, 'activeElement', {
		get: () => state.activeElement,
		set: (value: HTMLElement | null) => {
			state.activeElement = value;
		},
		configurable: true
	});
	Object.defineProperty(element, 'focusableElements', {
		get: () => state.focusableElements,
		set: (value: HTMLElement[] | null) => {
			state.focusableElements = value;
		},
		configurable: true
	});
	Object.defineProperty(element, 'windowResize', {
		get: () => state.windowResize,
		set: (value: ((event: Event) => void) | null) => {
			state.windowResize = value;
		},
		configurable: true
	});
	on('open', () => emit('open'));
	on('close', () => emit('close'));
	on('closed', () => emit('closed'));
	on('resize', () => emit('resize'));
	on('maximize', () => emit('maximize'));
	on('unmaximize', () => emit('unmaximize'));
});

onUnmounted(() => {
	window.removeEventListener('localize', applyLocalization);
});
</script>
