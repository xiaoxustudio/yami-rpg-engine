import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { addClass, hasClass, removeClass } from '../../../utils/dom';
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

const dispatchResizeEvent = (el: HTMLElement): void => {
	el.dispatchEvent(new Event('resize'));
};

export function attachPageManagerApi(el: HTMLElement): PageManagerApi {
	const manager = el as PageManagerApi;
	if (isApiAttached(manager)) return manager;

	manager.index = null;
	manager.active = null;
	manager.switchEventEnabled = false;

	manager.switch = function (value: string | null): void {
		const last = manager.index;
		if (last !== value) {
			let target: HTMLElement | null = null;
			if (value !== null) {
				// 第 122 轮：原来写的是 `el.childNodes as unknown as PageFrameElement[]`。两处都换了：
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
			const active = manager.active;
			if (active !== target) {
				manager.index = value;
				manager.active = target;
				if (active) removeClass(active, 'visible');
				if (target) addClass(target, 'visible');
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

	markApiAttached(manager);
	return manager;
}

export function createPageManagerElement(): PageManagerApi {
	const el = document.createElement('div');
	el.className = 'page-manager';
	return attachPageManagerApi(el);
}
