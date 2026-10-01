<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue';
import {
	clamp,
	addClass,
	removeClass,
	hasClass,
	rect,
	rasterize,
	focusWithOptions
} from '../../../utils/dom';
import { attachApi } from '../../../utils/attach-api';
import YMFormButtons from '../../basic/YMFormButtons/YMFormButtons.vue';

interface WindowFrameHost {
	positionMode?: string;
	absolutePos?: { x: number; y: number };
	frames?: HTMLElement[] & {
		append(element: HTMLElement): boolean;
		remove(element: HTMLElement): boolean;
	};
	ambient?: { update(): void };
	close?(id?: string): void;
}

function getWindow(): WindowFrameHost | undefined {
	return (window as Window & { Window?: WindowFrameHost }).Window;
}

interface LocalizeAdapter {
	components?: Record<string, unknown>;
	setElement(el: Element, item: unknown): void;
}

interface Props {
	id?: string;
	focusableSelector?: string;
	localize?: LocalizeAdapter | null;
	showApply?: boolean;
	buttonsIdPrefix?: string;
	noButtons?: boolean;
	/** 表单无效时禁用确认按钮（透传到 YMFormButtons 的 `button[name=confirm]`） */
	confirmDisabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	focusableSelector: 'input, select, textarea, button',
	localize: null,
	showApply: false,
	buttonsIdPrefix: '',
	noButtons: false,
	confirmDisabled: false
});

const emit = defineEmits<{
	open: [];
	close: [];
	closed: [];
	resize: [];
	maximize: [];
	unmaximize: [];
}>();

const root = ref<HTMLElement | null>(null);

/*
 * 模板根节点带 `role="dialog"`（窗口框架对外就是对话框）。**不写 `aria-modal`**：
 * 模态与否由宿主窗口管理器决定（`editor/.../window-object.ts` 的
 * activateModalMode / deactivateModalMode），组件自身无从得知，写死 `true`
 * 会让非模态工具窗谎报模态、把读屏困在窗内。
 *
 * 同理，说明性文字不要写成模板里的 HTML 注释 —— 模板里出现注释会让组件变成多根。
 */

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
	listener: (event: Event) => void,
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
			state.windowResize = (_event: Event) => {
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
	switch (mode ?? getWindow()?.positionMode) {
		case 'center':
			center();
			break;
		case 'absolute': {
			const pos = getWindow()?.absolutePos ?? { x: 0, y: 0 };
			absolute(pos.x, pos.y);
			break;
		}
		case 'overlap': {
			const frames = getWindow()?.frames ?? [];
			const parent = frames[frames.length - 2];
			if (parent && parent instanceof HTMLElement) {
				overlap(parent);
			} else {
				center();
			}
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
	const x = rasterize((window.innerWidth - r.width) / 2);
	const y = rasterize((window.innerHeight - r.height) / 2);
	setPosition(x, y, r);
};

const absolute = (left: number, top: number): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const r = rect(element);
	const x = rasterize(left);
	const y = rasterize(top);
	setPosition(x, y, r);
};

const overlap = (parent: HTMLElement): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const r = rect(element);
	const { left, top } = parent.style;
	const x = rasterize(parseFloat(left) + 24);
	const y = rasterize(parseFloat(top) + 24);
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
	element.style.left = `${clamp(x, 0, xMax)}px`;
	element.style.top = `${clamp(y, 0, yMax)}px`;
};

const open = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const W = getWindow();
	if (W?.frames!.append(element)) {
		W.ambient?.update();
		addClass(element, 'open');
		computePosition();
		element.style.zIndex = String(W.frames?.length ?? 0);
		element.dispatchEvent(new Event('open'));
		if (state.resizeEventEnabled && hasClass(element, 'maximized')) {
			element.dispatchEvent(new Event('resize'));
			window.addEventListener('resize', state.windowResize!);
		}
	} else if (!hasClass(element, 'open')) {
		addClass(element, 'open');
		W?.ambient?.update();
		element.style.zIndex = String(W?.frames?.length ?? 0);
		element.dispatchEvent(new Event('open'));
	}
};

const close = (): boolean => {
	const element = root.value;
	if (!element) {
		return false;
	}
	if (state.closeEventEnabled) {
		try {
			if (
				!element.dispatchEvent(
					new Event('close', {
						cancelable: true
					})
				)
			) {
				return false;
			}
		} catch (error) {
			console.error('[window-frame] close event handler error:', error);
		}
	}
	const W = getWindow();
	if (W?.frames!.remove(element)) {
		W.ambient?.update();
		removeClass(element, 'open');
		if (state.closedEventEnabled) {
			try {
				element.dispatchEvent(new Event('closed'));
			} catch (error) {
				console.error('[window-frame] closed event handler error:', error);
			}
		}
		if (state.resizeEventEnabled && hasClass(element, 'maximized')) {
			window.removeEventListener('resize', state.windowResize!);
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
			window.addEventListener('resize', state.windowResize!);
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
			window.removeEventListener('resize', state.windowResize!);
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
			focusWithOptions(state.activeElement, { preventScroll: true });
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
		const selector = props.focusableSelector;
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

defineExpose({
	open,
	close,
	maximize,
	unmaximize,
	focus,
	blur,
	setTitle,
	absolute,
	setPosition,
	on,
	root
});

const applyLocalization = (): void => {
	const element = root.value;
	if (!element) {
		return;
	}
	const local = props.localize;
	if (!local) {
		return;
	}
	const apply = (el: Element): void => {
		const item = local.components?.[el?.id];
		if (item) {
			local.setElement(el, item);
		}
	};
	apply(element);
	for (const el of element.querySelectorAll('[id]')) {
		apply(el);
	}
};

onMounted(() => {
	const element = root.value as HTMLElement & { [k: string]: unknown };
	if (!element) {
		return;
	}
	applyLocalization();
	window.addEventListener('localize', applyLocalization);
	attachApi(element, {
		open,
		close,
		maximize,
		unmaximize,
		focus,
		blur,
		setPosition,
		setTitle,
		absolute,
		on
	});
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
	element.addEventListener('cancel', () => close());
});

onUnmounted(() => {
	window.removeEventListener('localize', applyLocalization);
});
</script>

<template>
	<div class="window-frame" ref="root" :id="props.id" role="dialog">
		<slot name="title" />
		<div class="content-frame">
			<slot />
		</div>
		<YMFormButtons
			v-if="!props.noButtons"
			:id-prefix="props.buttonsIdPrefix || props.id || ''"
			:show-apply="props.showApply"
			:confirm-disabled="props.confirmDisabled"
		/>
	</div>
</template>

<style module>
:global(:where(.window-frame)) {
	display: none;
	position: fixed;
	box-shadow: 0 0 16px 0 rgba(0, 0, 0, 0.5);
	background-color: var(--window-background);
	outline: var(--window-outline);
	overflow: hidden;
}

:global(:where(.window-frame.open)) {
	display: block;
	pointer-events: auto;
}

:global(:where(.window-frame.blur)) {
	pointer-events: none;
}

:global(:where(.window-frame.translucent)) {
	filter: opacity(75%);
}

:global(:where(.window-frame.maximized)) {
	width: 100% !important;
	height: 100% !important;
}

:global(:where(.window-frame > .content-frame)) {
	position: absolute;
	top: 28px;
	bottom: 0;
	width: 100%;
}
</style>
