import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { addClass, dispatchResizeEvent, hasClass, removeClass } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

export interface PageManagerApi extends HTMLElement {
	index: string | null;
	active: HTMLElement | null;
	switchEventEnabled: boolean;
	switch(value: string | null): void;
	on(...args: unknown[]): void;
}

type PageFrameElement = HTMLElement & {
	dataValue?: string | null;
};

// page-frame 的 `dataValue`（`value` 属性的缓存）走显式元素数据。
// 注意 `manager.active` **不在此列**：Vue 版 YMPageManager 在元素上自建 `active` 访问器
// （遮蔽原型），命令式 createPageManagerElement 走原型访问器——两种实现并存，读取方
// （editor 的 layout.ts 等）按属性读，故这里保持原样。
const frameData = (el: unknown): PageFrameElement => elementDataOf<PageFrameElement>(el);

export function attachPageManagerApi(el: HTMLElement): PageManagerApi {
	const manager = el as PageManagerApi;
	if (isApiAttached(manager)) return manager;

	manager.index = null;
	manager.active = null;
	manager.switchEventEnabled = false;

	/**
	 * 把 `visible` 收敛到 `target` 一个页框。
	 *
	 * 页框由**整壳 Teleport**在分组间搬运，搬进来时带着它原来那个组的 `visible`；
	 * 原来只 `removeClass(active,'visible')`（只清自己记着的那个）⇒ 第二个 `.visible` 页框
	 * 会永远留着。页框是 `position:absolute; inset:0`，两个同时可见就是**完全叠在一起**，
	 * 且 DOM 序靠后的那个盖在上面（实机「点哪个页签都亮，内容永远是另一个面板」）。
	 */
	const normalizePages = (target: HTMLElement | null): void => {
		for (const child of el.children) {
			if (!hasClass(child, 'page-frame')) continue;
			if (child === target) addClass(child, 'visible');
			else removeClass(child, 'visible');
		}
	};

	manager.switch = function (value: string | null): void {
		// 目标页框（可能还没被 Teleport 搬进来 ⇒ null）
		let target: HTMLElement | null = null;
		if (value !== null) {
			// 原来写的是 `el.childNodes as unknown as PageFrameElement[]`。两处都换了：
			//  · 遍历 `children`（元素集合）而不是 `childNodes`：**可证等价** —— 循环体只在
			//    `hasClass(child, 'page-frame')` 为真时才继续，而 `hasClass` 对没有 `classList`
			//    的节点（文本/注释节点）直接返回 false（见其实现）⇒ 那些节点原本就走不到里面。
			//  · 断言压到真正需要它的那一处（`target` 声明为 `HTMLElement`），并降为**单次**
			//    `as`：`Element` 与 `HTMLElement` 可比，tsc 会真的检查这次收窄。
			for (const child of el.children) {
				if (hasClass(child, 'page-frame')) {
					const data = frameData(child);
					if (data.dataValue === undefined) {
						data.dataValue = child.getAttribute('value');
					}
					if (data.dataValue === value) {
						target = child as HTMLElement;
						break;
					}
				}
			}
		}
		// 幂等归一化（**无条件**执行）：页框可能带着旧组的 `.visible` 被 Teleport 搬进来，
		// 而那时 index/active 早已就位 ⇒ 只清 `active` 会漏掉第二个可见页框。
		normalizePages(target);
		const last = manager.index;
		const active = manager.active;
		if (last === value && active === target) return;
		manager.index = value;
		manager.active = target;
		if (last !== value) {
			if (manager.switchEventEnabled) {
				const event = createPayloadEvent(
					'switch',
					{} as {
						last: string | null;
						value: string | null;
					}
				);
				event.last = last;
				event.value = value;
				el.dispatchEvent(event);
			}
			if (active) dispatchResizeEvent(active);
			if (target) dispatchResizeEvent(target);
		}
	};

	manager.on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener, listenerOptions);
		if (type === 'switch') {
			manager.switchEventEnabled = true;
		}
	};

	const nodes = el.childNodes;
	if (nodes.length > 0) {
		let i = nodes.length;
		while (--i >= 0) {
			const child = nodes[i] as PageFrameElement;
			if (hasClass(child, 'page-frame')) {
				frameData(child).dataValue = child.getAttribute('value');
			} else {
				el.removeChild(child);
			}
		}
	}

	// Teleport 搬入页框的时刻晚于「激活写入」，那时 index 早已就位但 active 还是 null ——
	// 只归一化一次会漏掉它。子节点一变就按当前 index 重放一次 `switch`（幂等，只动 class 不会自激）：
	// 它会把「刚到达的目标页」重新解析成 active 并置为唯一可见，同时清掉搬进来的旧 `visible`。
	new MutationObserver(() => {
		if (manager.index !== null) manager.switch(manager.index);
	}).observe(el, { childList: true });

	markApiAttached(manager);
	return manager;
}

export function createPageManagerElement(): PageManagerApi {
	const el = document.createElement('div');
	el.className = 'page-manager';
	return attachPageManagerApi(el);
}
