import { addClass, hasClass, removeClass } from '../../../utils/dom';

export interface PageManagerApi extends HTMLElement {
	index: any;
	active: HTMLElement | null;
	switchEventEnabled: boolean;
	_initialized: boolean;
	switch(value: any): void;
	on(...args: unknown[]): any;
}

const dispatchResizeEvent = (el: HTMLElement): void => {
	el.dispatchEvent(new Event('resize'));
};

export function attachPageManagerApi(el: HTMLElement): PageManagerApi {
	const manager = el as PageManagerApi;
	if (manager._initialized) return manager;

	manager.index = null;
	manager.active = null;
	manager.switchEventEnabled = false;

	manager.switch = function (value: any): void {
		const last = manager.index;
		if (last !== value) {
			let target: HTMLElement | null = null;
			if (value !== null) {
				for (const child of el.childNodes as any) {
					if (hasClass(child, 'page-frame')) {
						if (child.dataValue === undefined) {
							child.dataValue = child.getAttribute('value');
						}
						if (child.dataValue === value) {
							target = child;
							break;
						}
					}
				}
			}
			const active = manager.active;
			if (active !== target) {
				manager.index = value;
				manager.active = target;
				active && removeClass(active, 'visible');
				target && addClass(target, 'visible');
				if (manager.switchEventEnabled) {
					const event: any = new Event('switch');
					event.last = last;
					event.value = value;
					el.dispatchEvent(event);
				}
				active && dispatchResizeEvent(active);
				target && dispatchResizeEvent(target);
			}
		}
	};

	manager.on = function (
		type: string,
		listener: (event: any) => void,
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
			const child: any = nodes[i];
			if (hasClass(child, 'page-frame')) {
				child.dataValue = child.getAttribute('value');
			} else {
				el.removeChild(child);
			}
		}
	}

	manager._initialized = true;
	return manager;
}

export function createPageManagerElement(): PageManagerApi {
	const el = document.createElement('div');
	el.className = 'page-manager';
	return attachPageManagerApi(el);
}
