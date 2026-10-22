import { elementDataOf, elementDataValueOf } from './element-data';

export const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

/** 四舍五入到指定小数位（与 editor `utils/math.ts` 同口径） */
export const roundTo = (value: number, decimals: number): number => {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
};

export const numberPattern = /^-?\d+(?:\.\d+)?$/;

/** 把 `value` 属性文本解析成 number（数字字面量）或原字符串 */
export const parseNumberOrString = (string: string): unknown =>
	numberPattern.test(string) ? parseFloat(string) : string;

export const focusWithOptions = (el: Element | null | undefined, options?: FocusOptions): void => {
	(el as Element & { focus(options?: FocusOptions): void }).focus(options);
};

export const addClass = (
	el: { classList?: DOMTokenList } | null | undefined,
	className: string
): boolean => {
	if (!el || !el.classList) return false;
	if (!el.classList.contains(className)) {
		el.classList.add(className);
		return true;
	}
	return false;
};

export const removeClass = (
	el: { classList?: DOMTokenList } | null | undefined,
	className: string
): boolean => {
	if (!el || !el.classList) return false;
	if (el.classList.contains(className)) {
		el.classList.remove(className);
		return true;
	}
	return false;
};

export const hasClass = (
	el: { classList?: DOMTokenList } | null | undefined,
	className: string
): boolean => !!el && !!el.classList && el.classList.contains(className);

export const hide = (el: HTMLElement | null | undefined): HTMLElement => {
	if (el) addClass(el, 'hidden');
	return el as HTMLElement;
};

export const show = (el: HTMLElement | null | undefined): HTMLElement => {
	if (el) removeClass(el, 'hidden');
	return el as HTMLElement;
};

export const seek = (el: EventTarget | null, tagName: string, count = 1): HTMLElement => {
	let element: HTMLElement = el as HTMLElement;
	const classMode = tagName.startsWith('.');
	const matches = (target: HTMLElement): boolean =>
		classMode ? hasClass(target, tagName.slice(1)) : target.tagName === tagName.toUpperCase();
	while (count-- > 0) {
		if (!matches(element) && element.parentNode instanceof HTMLElement) {
			element = element.parentNode;
			continue;
		}
		break;
	}
	return element;
};

export const css = (el: Element): CSSStyleDeclaration => getComputedStyle(el);

export const rect = (el: Node | null): DOMRect => (el as Element).getBoundingClientRect();

/**
 * 读写元素值：自带 `read` / `write` 或 own `dataValue` 的宿主走自身，
 * 元素走元素数据，其余读写都不发生。
 */
export const read = (
	el: HTMLElement | { read?: () => unknown; dataValue?: unknown } | null | undefined
): unknown => {
	if (el && 'read' in el && typeof el.read === 'function') {
		return el.read();
	}
	return elementDataValueOf(el);
};

export const write = (
	el: HTMLElement | { write?: (value: unknown) => void; dataValue?: unknown } | null | undefined,
	value: unknown
): void => {
	if (el && 'write' in el && typeof el.write === 'function') {
		el.write(value);
		return;
	}
	if (el === null || el === undefined || typeof el !== 'object') return;
	if (Object.prototype.hasOwnProperty.call(el, 'dataValue')) {
		(el as { dataValue: unknown }).dataValue = value;
		return;
	}
	if (el instanceof HTMLElement) elementDataOf<{ dataValue?: unknown }>(el).dataValue = value;
};

export const hasScrollBar = (el: HTMLElement): boolean =>
	el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;

export const rasterize = (csspx: number): number => {
	const dpr = window.devicePixelRatio;
	return Math.round(csspx * dpr) / dpr;
};

export const relate = (a: PointerEvent, b: PointerEvent): boolean => a.pointerId === b.pointerId;

export const debounce = <T extends (...args: never[]) => void>(callback: T, delay: number): T => {
	let timer: ReturnType<typeof setTimeout> | null = null;
	return ((...args: Parameters<T>) => {
		if (timer !== null) {
			clearTimeout(timer);
		}
		timer = setTimeout(() => {
			timer = null;
			callback(...args);
		}, delay);
	}) as T;
};

export const getRelativeCoords = (
	event: PointerEvent,
	el: HTMLElement
): { x: number; y: number } => {
	const r = rect(el);
	return { x: event.clientX - r.left, y: event.clientY - r.top };
};

export const isInContent = (el: HTMLElement, event: PointerEvent): boolean => {
	const coords = getRelativeCoords(event, el);
	const x = coords.x - el.scrollLeft;
	const y = coords.y - el.scrollTop;
	return x >= 0 && x < el.clientWidth && y >= 0 && y < el.clientHeight;
};

const changeEvent = new Event('change');
export const dispatchChangeEvent = (
	el: { dispatchEvent: (event: Event) => unknown },
	_index = 0
): void => {
	el.dispatchEvent(changeEvent);
};

const updateEvent = new Event('update');
export const dispatchUpdateEvent = (el: { dispatchEvent: (event: Event) => unknown }): void => {
	el.dispatchEvent(updateEvent);
};

const rowModelEvent = new Event('rowmodel');
/**
 * **可见行窗口变了**（虚拟滚动窗口移动）——比 `update` 轻得多：只让"渲染行的那一方"重建行，
 * 不触发数据/标记重算。
 *
 * 为什么需要它：模板化行渲染（行由 `v-for` 挂）之后，窗口一变模型就变，而渲染方只有
 * `update`（太重：editor 侧会遍历**全部**行重算 mark）与 `scroll`（太频：每个滚动事件一次，
 * 每次都要按行绑元素并强制布局）两个信号可用。虚拟列表需要一个"窗口真的动了"的信号；
 * 缺了它就只剩这两个坏选择，实机表现是滚动抖动/行内容闪烁（2026-10-01）。
 */
export const dispatchRowModelEvent = (el: { dispatchEvent: (event: Event) => unknown }): void => {
	el.dispatchEvent(rowModelEvent);
};

const resizeEvent = new Event('resize');
export const dispatchResizeEvent = (el: { dispatchEvent: (event: Event) => unknown }): void => {
	el.dispatchEvent(resizeEvent);
};

let windowFramesLengthProvider: (() => number) | null = null;

export const setWindowFramesLengthProvider = (provider: (() => number) | null): void => {
	windowFramesLengthProvider = provider;
};

export const getWindowFramesLength = (): number => {
	if (windowFramesLengthProvider) return windowFramesLengthProvider();
	const win = (window as Window & { Window?: { frames?: { length: number } } }).Window;
	return (win?.frames?.length ?? 0) + 1;
};

let lastDoubleclick: PointerEvent | null = null;

const doubleclickPointerdown = function (
	this: HTMLElement,
	event: PointerEvent & { cmdOrCtrlKey?: boolean; doubleclickProcessed?: boolean }
): void {
	if (
		!(event.ctrlKey || event.metaKey) &&
		!event.altKey &&
		!event.shiftKey &&
		!event.doubleclickProcessed
	) {
		event.doubleclickProcessed = true;
		switch (event.button) {
			case 0:
				if (
					lastDoubleclick !== null &&
					event.target === lastDoubleclick.target &&
					event.timeStamp - lastDoubleclick.timeStamp < 500 &&
					Math.abs(event.clientX - lastDoubleclick.clientX) < 4 &&
					Math.abs(event.clientY - lastDoubleclick.clientY) < 4 &&
					isInContent(this, event)
				) {
					if (!event.target!.dispatchEvent(new PointerEvent('doubleclick', event))) {
						event.preventDefault();
					}
					lastDoubleclick = null;
				} else {
					lastDoubleclick = event;
				}
				break;
			default:
				lastDoubleclick = null;
				break;
		}
	}
};

export const attachDoubleclick = (
	element: EventTarget,
	listener: (event: PointerEvent) => void,
	options?: boolean | AddEventListenerOptions
): void => {
	element.addEventListener('pointerdown', doubleclickPointerdown as EventListener);
	element.addEventListener('doubleclick', listener as EventListener, options);
};

export const isMac =
	typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/** Cmd（mac）/ Ctrl（其他平台）是否按下——列表键盘处理的统一口径 */
export const cmdOrCtrlKey = (event: KeyboardEvent): boolean =>
	isMac ? event.metaKey : event.ctrlKey;

export const macRedoKey = (e: KeyboardEvent): boolean =>
	isMac ? e.metaKey && e.shiftKey && e.code === 'KeyZ' : false;

export const hideDragImage = (dt: DataTransfer | null): void => {
	if (dt) dt.setDragImage(new Image(), 0, 0);
};

/**
 * 把**文本**转义成可安全交给 `v-html` 的 HTML 片段。
 *
 * 取代"建一个 `div`、写 `textContent`、再读 `innerHTML`"的往返：那条路径在**求值期**造 DOM，
 * 放进 `computed` 里尤其不合适（每次失效都新建节点，且依赖 `document` 存在）。
 * 转义口径与浏览器序列化文本节点一致——`&` 必须**最先**替换，否则会把后面生成的实体二次转义。
 */
export const escapeHtml = (value: string): string =>
	value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
