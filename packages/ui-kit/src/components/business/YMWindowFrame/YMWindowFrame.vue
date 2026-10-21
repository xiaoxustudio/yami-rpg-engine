<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
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
import { useEventListener } from '../../../composables/useEventListener';
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
	confirm: [];
	apply: [];
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

/**
 * window 上的 `resize` 是否挂着 —— 专供 `useEventListener` 的 `enabled`。
 *
 * 它是**状态相关**而非挂载期常驻：只有「最大化 + 该组件被 `on('resize')` 订阅过」时才需要
 * （原实现在 `open`/`maximize` 里挂、在 `close`/`unmaximize` 里摘，四处手工配对）。
 * `state` 已是 `reactive`，但「是否最大化」是 DOM class（`hasClass(element,'maximized')`）
 * 不是响应式的，所以不能直接拿它当开关，仍另起一个 ref，与那四处的语义同进同出。
 */
const resizeActive = ref(false);

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
			resizeActive.value = true;
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
			resizeActive.value = false;
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
			resizeActive.value = true;
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
			resizeActive.value = false;
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

// 全局 `localize` 监听走 composable：挂/摘成对，不再在 onMounted/onUnmounted 里手工配对。
// `applyLocalization` 自身对「元素未就绪」「没有 localize」都有早退保护，故 setup 期注册是安全的；
// 首次应用仍由 onMounted 里那次 `applyLocalization()` 完成。
useEventListener(window, 'localize', applyLocalization);

/**
 * window 上的 `resize` 也走 composable，`enabled` 由 `resizeActive` 驱动
 * （见其注释：最大化 / 订阅状态变化时挂或摘）。
 *
 * 处理器**在调用时**才读 `state.windowResize`，而不是注册时捕获：
 * 该属性可由外部随时改写（元素上的 setter 见下），原先「注册时捕获、摘除时读当前值」的写法
 * 在窗口活着时被换过 `windowResize` 的情况下**会摘不掉旧函数**，是个已存在的隐患；
 * 调用时读取顺带把它消掉了。
 */
useEventListener(window, 'resize', (event) => state.windowResize?.(event), {
	enabled: resizeActive
});

onMounted(() => {
	const element = root.value as HTMLElement & { [k: string]: unknown };
	if (!element) {
		return;
	}
	applyLocalization();
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
	// `YMFormButtons` 现在**同时**派发原生事件与 Vue emit。这里改走 emit 通道
	// （模板 `@confirm` / `@apply` / `@cancel`，见下），因此不再需要原生桥。
	//
	// 历史：原先只桥了 `cancel`、漏了 `confirm`，导致外层包装组件
	// （YMZoom / YMFont / YMRename / YMSetKey / YMSetQuantity / YMRequestKeyValue /
	// YMArrayListString / YMArrayListNumber 等 12 处）在
	// `frame.value.root.addEventListener('confirm', …)` 上等的那个事件**永远不会到来**，
	// 表现为"点确定没反应"。那 12 处已改为模板 `@confirm`，故这层桥可以整体删掉。
	//
	// ⚠️ 不要再在这里挂原生 `confirm`/`apply` 监听：`YMFormButtons` 的原生派发仍在，
	// 两条通道都接就会**双触发**。
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
			@confirm="emit('confirm')"
			@apply="emit('apply')"
			@cancel="close()"
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
