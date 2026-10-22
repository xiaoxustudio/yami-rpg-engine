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
	 * 页框是 `position:absolute; inset:0`，两个同时可见就是**完全叠在一起**，
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
		let target: HTMLElement | null = null;
		if (value !== null) {
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
