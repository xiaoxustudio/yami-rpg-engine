import { $, renderDetached } from '@app/utils/dom';
import { Timer } from '@app/utils/timer';
import { Cursor } from '../composables/usePointerObjectWindow';
import {
	createScrollBarElement as createScrollBar,
	elementDataOf,
	elementDataValueOf
} from '@ui-kit';
import { attachDoubleclick, detachDoubleclick } from '@app/utils/doubleclick';
import { Fragment, h, render, type VNode } from 'vue';
import type { EditorEvent, YamiMouseEvent, YamiEvent } from '@app/types/editor-event';

/**
 * `element-utils.ts` 装配 / 消费的**滚动宿主**契约。
 *
 * 这些成员过去声明在全局 `HTMLElement` 上——于是"没装滚动条的普通 `div`"也看起来有
 * `setScroll()`（拼错方法名同样不报错）。现在只有**显式声明为滚动宿主**的元素才具备，
 * 而"装配点"（`addScrollbars` / `addSetScrollMethod`）就是这个契约的唯一来源。
 */
export interface ScrollableElement extends HTMLElement {
	beginScrolling(): void;
	endScrolling(): void;
	setScroll(left: number, top: number): void;
	setScrollLeft(left: number): void;
	setScrollTop(top: number): void;
	updateScrollbars(): void;
	scrollPointerup: (event: YamiMouseEvent) => void;
	scrollPointermove: (event: YamiMouseEvent) => void;
	scrollPointerdown?: (event: YamiEvent) => void;
	/** 画布引擎缓存的"未乘 dpr 的滚动位置"（`engine/screen-scroll-data.ts`） */
	rawScrollLeft?: number;
	rawScrollTop?: number;
}

export function on(
	// oxlint-disable-next-line no-explicit-any
	el: any,
	type: string,
	// oxlint-disable-next-line no-explicit-any
	listener: (event: any) => void,
	options?: AddEventListenerOptions
): void {
	if (!el) {
		console.error('[on] el is null/undefined, type:', type, 'stack:', new Error().stack);
		return;
	}
	if (typeof el.on === 'function') {
		el.on(type, listener, options);
		return;
	}
	if (type === 'doubleclick') {
		attachDoubleclick(el, listener, options);
		return;
	}
	el.addEventListener(type, listener, options);
}

export function off(
	// oxlint-disable-next-line no-explicit-any
	el: any,
	type: string,
	// oxlint-disable-next-line no-explicit-any
	listener: (event: any) => void,
	options?: EventListenerOptions
): void {
	if (!el) return;
	if (typeof el.off === 'function') {
		el.off(type, listener, options);
		return;
	}
	if (type === 'doubleclick') {
		detachDoubleclick(el, listener, options);
		return;
	}
	el.removeEventListener(type, listener, options);
}

export function emit(el: EventTarget, type: string, detail?: unknown): boolean {
	return el.dispatchEvent(new CustomEvent(type, { detail }));
}

export function show<T>(el: T): T {
	const target = el as { classList?: DOMTokenList } | null | undefined;
	if (!target) return el;
	removeClass(target, 'hidden');
	return el;
}

export function hide<T>(el: T): T {
	const target = el as { classList?: DOMTokenList } | null | undefined;
	if (!target) return el;
	addClass(target, 'hidden');
	return el;
}

export function addClass(el: unknown, className: string): boolean {
	const target = el as { classList?: DOMTokenList } | null | undefined;
	if (!target) return false;
	if (!target.classList) {
		console.error('[addClass] el has no classList:', el, 'stack:', new Error().stack);
		return false;
	}
	if (!target.classList.contains(className)) {
		target.classList.add(className);
		return true;
	}
	return false;
}

export function removeClass(el: unknown, className: string): boolean {
	const target = el as { classList?: DOMTokenList } | null | undefined;
	if (!target) return false;
	if (!target.classList) {
		console.error('[removeClass] el has no classList:', el, 'stack:', new Error().stack);
		return false;
	}
	if (target.classList.contains(className)) {
		target.classList.remove(className);
		return true;
	}
	return false;
}

export function hasClass(el: unknown, className: string): boolean {
	const target = el as { classList?: DOMTokenList } | null | undefined;
	if (!target || !target.classList) return false;
	return target.classList.contains(className);
}

export function enable(el: unknown): void {
	removeClass(el, 'disabled');
}

export function disable(el: unknown): void {
	addClass(el, 'disabled');
}

export function seek(el: HTMLElement, tagName: string, count: number = 1): HTMLElement {
	let element: HTMLElement = el;
	while (count-- > 0) {
		if (
			element.tagName !== tagName.toUpperCase() &&
			element.parentNode instanceof HTMLElement
		) {
			element = element.parentNode;
			continue;
		}
		break;
	}
	return element;
}

export function css(el: Element): CSSStyleDeclaration {
	return getComputedStyle(el);
}

export function rect(el: unknown): DOMRect {
	return (el as Element).getBoundingClientRect();
}

/**
 * 清空元素内容。
 *
 * ⚠️ 第 124 轮：返回类型原来是 `HTMLElement`，但 `if (!el)` 那一支**真的返回 `null` / `undefined`**
 * —— 类型在说谎，`return el as unknown as HTMLElement` 就是替这个谎背书。
 * 已放宽为 `HTMLElement | null | undefined`。依据：全仓**没有任何调用方取用它的返回值**
 * （实测 `= clear(` / `return clear(` / `clear(…).x` 三种形态都是 0 处）⇒ 无涟漪。
 * 同时那一支与末尾那两个断言都不再需要。
 */
export function clear(el: Node | null | undefined): HTMLElement | null | undefined {
	if (!el) return el;
	const element = el as HTMLElement & { clear?: () => unknown };
	// 列表/面板自带 `clear()` 时必须走它：直接 `textContent = ''` 会把**行元素/子组件**从 DOM 里
	// 摘掉，Vue 的节点表随即失真 —— 之后任何一次 patch 都会以 null 容器 insert，
	// 真机表现为 `Cannot read properties of null (reading 'insertBefore')`（已在命令列表上复现：
	// wipe 之后下一次更新必崩，栈与真机一致）。
	// 树列表本就有这条特判，这里推广到全部自带 clear 的列表/面板
	// （命令行、通用列表、参数面板、选择框、日志/队伍列表……它们的 clear 都是"清空自身内容"语义）。
	if (typeof element.clear === 'function') {
		element.clear();
		return element;
	}
	el.textContent = '';
	return element;
}

// oxlint-disable-next-line no-explicit-any
export function read(el: unknown): any {
	if (el == null) {
		return undefined;
	}
	if (typeof (el as { read: () => unknown }).read === 'function') {
		return (el as { read: () => unknown }).read();
	}
	// `dataValue` 有两种承载者（组件 own 访问器 / 元素数据），统一走 elementDataValueOf。
	return elementDataValueOf(el);
}

export function write(el: unknown, value: unknown): void {
	if (el == null) {
		return;
	}
	if (typeof (el as { write: (value: unknown) => void }).write === 'function') {
		(el as { write: (value: unknown) => void }).write(value);
	} else if (
		el instanceof HTMLElement &&
		!Object.prototype.hasOwnProperty.call(el, 'dataValue')
	) {
		elementDataOf<{ dataValue?: unknown }>(el).dataValue = value;
	} else {
		(el as { dataValue: unknown }).dataValue = value;
	}
}

export function getFocus(el: unknown, mode: string | null = null): void {
	const target = el as
		| {
				focus?(): void;
				select?(): void;
				value?: string;
				selectionStart?: number;
				selectionEnd?: number;
				scrollLeft?: number;
		  }
		| null
		| undefined;
	setTimeout(() => {
		if (!target || typeof target.focus !== 'function') return;
		target.focus();
		switch (mode) {
			case 'all':
				if (typeof target.select === 'function') {
					target.select();
					target.scrollLeft = 0;
				}
				break;
			case 'end':
				if (typeof target.selectionStart === 'number') {
					const endIndex = target.value!.length;
					target.selectionStart = endIndex;
					target.selectionEnd = endIndex;
				}
				break;
		}
	});
}

const resizeEvent = new Event('resize');
export function dispatchResizeEvent(el: EventTarget): void {
	el.dispatchEvent(resizeEvent);
}

export function focus(el: HTMLElement): void {
	el.focus();
}

export function blur(el: HTMLElement): void {
	el.blur();
}

export const setTooltip = (function IIFE() {
	const tooltip = $('#tooltip');
	const capture = { capture: true };
	let state: string = 'closed';
	let target: HTMLElement | null = null;
	let timeStamp: number = 0;
	let clientX: number = 0;
	let clientY: number = 0;
	const parseTip = function (tip: string): Array<string | VNode> {
		const nodes: Array<string | VNode> = [];
		const pattern = /<b>([\s\S]*?)<\/b>|<tooltip-line><\/tooltip-line>/g;
		let index = 0;
		let match: RegExpExecArray | null;
		while ((match = pattern.exec(tip)) !== null) {
			if (match.index > index) {
				nodes.push(tip.slice(index, match.index));
			}
			if (match[0].startsWith('<b>')) {
				nodes.push(h('b', {}, match[0].slice(3, -4)));
			} else {
				nodes.push(h('div', { class: 'tooltip-line' }));
			}
			index = pattern.lastIndex;
		}
		if (index < tip.length) {
			nodes.push(tip.slice(index));
		}
		return nodes;
	};
	const createTimer = () =>
		new Timer({
			duration: 0,
			callback: () => {
				if (state === 'waiting') {
					let tip = (target as (HTMLElement & { tip?: string }) | null)?.tip ?? '';
					if (!tip) {
						state = 'closed';
						window.removeEventListener('keydown', close, capture);
						window.removeEventListener('pointerdown', close, capture);
						return;
					}
					const hotkey = target?.getAttribute?.('hotkey');
					if (hotkey) {
						if (tip.includes('\n')) {
							tip = tip.replace('\n', ` (${hotkey})\n`);
						} else {
							tip += ` (${hotkey})`;
						}
					}
					state = 'open';
					addClass(tooltip, 'open');
					render(h(Fragment, parseTip(tip)), tooltip);
					const { width, height } = tooltip.getBoundingClientRect();
					const right = window.innerWidth - width;
					const bottom = window.innerHeight - height;
					const x = Math.min(clientX + 10, right);
					const y = Math.min(clientY + 15, bottom);
					tooltip.style.left = `${x}px`;
					tooltip.style.top = `${y}px`;
				}
			}
		});
	let timer: Timer | null = null;

	const close = function (): void {
		switch (state) {
			case 'waiting':
			case 'open':
				state = 'closed';
				timer?.remove();
				removeClass(tooltip, 'open');
				window.removeEventListener('keydown', close, capture);
				window.removeEventListener('pointerdown', close, capture);
				break;
		}
	};

	const pointermove = function (this: HTMLElement, event: PointerEvent): void {
		if (timeStamp === event.timeStamp) {
			return;
		}
		timeStamp = event.timeStamp;
		switch (state) {
			case 'closed':
				if (target !== this) {
					state = 'waiting';
					// oxlint-disable-next-line no-this-alias
					target = this;
					const t = (timer ??= createTimer());
					t.elapsed = 0;
					t.duration = 250;
					t.add();
					clientX = event.clientX;
					clientY = event.clientY;
					window.addEventListener('keydown', close, capture);
					window.addEventListener('pointerdown', close, capture);
				}
				break;
			case 'waiting':
				if (target === this) {
					const t = (timer ??= createTimer());
					t.elapsed = 0;
					t.add();
					clientX = event.clientX;
					clientY = event.clientY;
				} else {
					close();
				}
				break;
			case 'open':
				if (target !== this) {
					close();
				}
				break;
		}
	};

	const pointerleave = function (this: HTMLElement, event: PointerEvent): void {
		if (
			!(event.relatedTarget instanceof HTMLElement && tooltip.contains(event.relatedTarget))
		) {
			target = null;
			close();
		}
	};

	tooltip.addEventListener('pointerleave', (_event: PointerEvent) => {
		target = null;
		close();
	});

	return function (el: HTMLElement & { tip?: string }, tip: string | (() => string)): void {
		if ('tip' in el === false) {
			el.addEventListener('pointermove', pointermove);
			el.addEventListener('pointerleave', pointerleave);
		}
		switch (typeof tip) {
			case 'string':
				el.tip = tip;
				break;
			case 'function':
				Object.defineProperty(el, 'tip', {
					configurable: true,
					get: tip as () => string
				});
				break;
		}
	};
})();

export function hideChildNodes(el: Node): void {
	for (const childNode of el.childNodes) {
		if (childNode.nodeType === Node.ELEMENT_NODE) {
			hide(childNode as HTMLElement);
		}
	}
}

export function showChildNodes(el: Node): void {
	for (const childNode of el.childNodes) {
		if (childNode.nodeType === Node.ELEMENT_NODE) {
			show(childNode as HTMLElement);
		}
	}
}

const changeEvents = [
	new Event('change', { bubbles: true }),
	new Event('change', { bubbles: true })
];
export function dispatchChangeEvent(el: unknown, index: number = 0): void {
	(el as EventTarget).dispatchEvent(changeEvents[index]);
}

const updateEvent = new Event('update');
export function dispatchUpdateEvent(el: HTMLElement): void {
	el.dispatchEvent(updateEvent);
}

export function hasScrollBar(el: HTMLElement): boolean {
	return el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
}

export function isInContent(el: unknown, event: MouseEvent): boolean {
	const target = el as {
		scrollLeft: number;
		scrollTop: number;
		clientWidth: number;
		clientHeight: number;
	};
	const coords = getRelativeCoords(event, target);
	const x = coords.x - target.scrollLeft;
	const y = coords.y - target.scrollTop;
	return x >= 0 && x < target.clientWidth && y >= 0 && y < target.clientHeight;
}

// 离屏节点统一走 utils/dom 的唯一创建缝隙（原先这里自带一份 createElement + render）
function renderElement(vnode: VNode): HTMLElement {
	return renderDetached(vnode);
}

export function addScrollbars(el: HTMLElement): void {
	const host = el as ScrollableElement;
	const hBar = createScrollBar();
	const vBar = createScrollBar();
	const corner = renderElement(h('div', { class: 'scroll-corner' }));
	const parent = el.parentNode as Node;
	const next = el.nextSibling;
	if (next) {
		parent.insertBefore(hBar, next);
		parent.insertBefore(vBar, next);
		parent.insertBefore(corner, next);
	} else {
		parent.appendChild(hBar);
		parent.appendChild(vBar);
		parent.appendChild(corner);
	}
	hBar.bind(el, 'horizontal');
	vBar.bind(el, 'vertical');

	const wheel = (event: WheelEvent) => {
		el.dispatchEvent(new WheelEvent('wheel', event));
	};
	on(hBar, 'wheel', wheel as (event: EditorEvent) => void, { passive: true });
	on(vBar, 'wheel', wheel as (event: EditorEvent) => void, { passive: true });
	on(corner, 'wheel', wheel as (event: EditorEvent) => void, { passive: true });

	const userscroll = new Event('userscroll');

	host.beginScrolling = function () {
		addClass(hBar, 'dragging');
		addClass(vBar, 'dragging');
	};

	host.endScrolling = function () {
		removeClass(hBar, 'dragging');
		removeClass(vBar, 'dragging');
	};

	host.setScroll = function (left: number, top: number) {
		const sl = el.scrollLeft;
		const st = el.scrollTop;
		el.scroll(left, top);
		if (el.scrollLeft !== sl || el.scrollTop !== st) {
			el.dispatchEvent(userscroll);
		}
	};

	host.setScrollLeft = function (left: number) {
		const sl = el.scrollLeft;
		el.scrollLeft = left;
		if (el.scrollLeft !== sl) {
			el.dispatchEvent(userscroll);
		}
	};

	host.setScrollTop = function (top: number) {
		const st = el.scrollTop;
		el.scrollTop = top;
		if (el.scrollTop !== st) {
			el.dispatchEvent(userscroll);
		}
	};

	let withCorner = false;
	host.updateScrollbars = function () {
		if (el.clientWidth < el.scrollWidth && el.clientHeight < el.scrollHeight) {
			if (!withCorner) {
				withCorner = true;
				addClass(hBar, 'with-corner');
				addClass(vBar, 'with-corner');
				addClass(corner, 'visible');
			}
		} else {
			if (withCorner) {
				withCorner = false;
				removeClass(hBar, 'with-corner');
				removeClass(vBar, 'with-corner');
				removeClass(corner, 'visible');
			}
		}
		hBar.updateHorizontalBar();
		vBar.updateVerticalBar();
	};
}

export function addSetScrollMethod(el: HTMLElement): void {
	const host = el as ScrollableElement;
	const userscroll = new Event('userscroll');

	host.setScroll = function (left: number, top: number) {
		const sl = el.scrollLeft;
		const st = el.scrollTop;
		el.scroll(left, top);
		if (el.scrollLeft !== sl || el.scrollTop !== st) {
			el.dispatchEvent(userscroll);
		}
	};
}

/**
 * 默认滚动拖拽记录（`dragging`）走**显式元素数据**——与 `Inspector.scrollPointerdown` 里的
 * `scrollData(this)` 是同一份存储。
 *
 * **为什么两边必须一致**：inspector 传的是自己的 `scrollPointerdown`（写元素数据），而 pointerup /
 * pointermove 用的是本文件的默认实现。若这里继续写普通 expando，写入与读取就落在**两个地方**——
 * `dragging` 永远清不掉（光标卡在 grab、后续 alt+拖拽被函数开头的早退挡掉）。访问器时代两者同走
 * WeakMap，所以这个分叉只在删除原型访问器之后才显现。
 */
type ScrollDragEvent = PointerEvent & {
	mode?: string;
	scrollLeft: number;
	scrollTop: number;
};
interface ScrollDragData {
	dragging: ScrollDragEvent | null;
}
const scrollDragData = (el: unknown): ScrollDragData => elementDataOf<ScrollDragData>(el);

const defaultPointerdown = function (this: ScrollableElement, event: YamiMouseEvent) {
	const data = scrollDragData(this);
	if (data.dragging) {
		return;
	}
	switch (event.button) {
		case 0:
			if (event.altKey) {
				event.preventDefault();
				event.stopImmediatePropagation();
				// 监听的是 `pointerdown`，运行期必然是 PointerEvent
				data.dragging = event as ScrollDragEvent;
				event.mode = 'scroll';
				event.scrollLeft = this.scrollLeft;
				event.scrollTop = this.scrollTop;
				Cursor.open('cursor-grab');
				window.addEventListener('pointerup', this.scrollPointerup as EventListener);
				window.addEventListener('pointermove', this.scrollPointermove as EventListener);
			}
			break;
	}
};

const scrollPointerup = function (this: ScrollableElement, event: YamiMouseEvent) {
	const data = scrollDragData(this);
	const { dragging } = data;
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				Cursor.close('cursor-grab');
				break;
		}
		data.dragging = null;
		window.removeEventListener('pointerup', this.scrollPointerup as EventListener);
		window.removeEventListener('pointermove', this.scrollPointermove as EventListener);
	}
};

const scrollPointermove = function (this: ScrollableElement, event: YamiMouseEvent) {
	const { dragging } = scrollDragData(this);
	if (dragging && relate(dragging, event)) {
		switch (dragging.mode) {
			case 'scroll':
				this.scrollLeft = dragging.scrollLeft + dragging.clientX - event.clientX;
				this.scrollTop = dragging.scrollTop + dragging.clientY - event.clientY;
				break;
		}
	}
};

export function listenDraggingScrollbarEvent(
	el: HTMLElement,
	pointerdown: (event: YamiMouseEvent) => void = defaultPointerdown,
	options?: boolean | AddEventListenerOptions
): void {
	const host = el as ScrollableElement;
	host.scrollPointerup = scrollPointerup.bind(host);
	host.scrollPointermove = scrollPointermove.bind(host);
	on(el, 'pointerdown', pointerdown, options as AddEventListenerOptions);
}

export function getRelativeCoords(event: YamiMouseEvent, el: unknown): { x: number; y: number } {
	const target = el as Element;
	const rect = target.getBoundingClientRect();
	return {
		x: event.clientX - rect.left - target.clientLeft + target.scrollLeft,
		y: event.clientY - rect.top - target.clientTop + target.scrollTop
	};
}

export function hideDragImage(dt: DataTransfer): void {
	dt.setDragImage(renderElement(h('div', { class: 'no-drag-image' })), 0, 0);
}

export function drawAndFitImage(
	ctx: CanvasRenderingContext2D,
	image: CanvasImageSource & { width: number; height: number },
	sx: number = 0,
	sy: number = 0,
	sw: number = image.width,
	sh: number = image.height
): void {
	const width = ctx.canvas.width;
	const height = ctx.canvas.height;
	let dw: number;
	let dh: number;
	if (sw <= width && sh <= height) {
		dw = sw;
		dh = sh;
	} else {
		const scaleX = width / sw;
		const scaleY = height / sh;
		if (scaleX < scaleY) {
			dw = width;
			dh = Math.round(sh * scaleX);
		} else {
			dw = Math.round(sw * scaleY);
			dh = height;
		}
	}
	const dx = (width - dw) >> 1;
	const dy = (height - dh) >> 1;
	ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
}

export function relate(
	a: { type: string; pointerId?: number } | Record<string, unknown>,
	b?: { type: string; pointerId?: number } | Record<string, unknown> | null
): boolean {
	return !!a && a.pointerId === b?.pointerId;
}
