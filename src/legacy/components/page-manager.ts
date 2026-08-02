import { addClass, removeClass, dispatchResizeEvent } from '@/util/element-utils.ts';

interface PageManagerElement extends HTMLElement {
	index: any;
	active: HTMLElement | null;
	switchEventEnabled: boolean;
	switch(value: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachPageManagerApi(el: HTMLElement): void {
	const manager = el as PageManagerElement;

	manager.index = null;
	manager.active = null;
	manager.switchEventEnabled = false;

	manager.switch = function (value: any): void {
		const last = manager.index;
		if (last !== value) {
			let target: HTMLElement | null = null;
			if (value !== null) {
				for (const child of el.childNodes as any) {
					if (child.tagName === 'PAGE-FRAME') {
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
		options?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener, options);
		if (type === 'switch') {
			manager.switchEventEnabled = true;
		}
	};

	const nodes = el.childNodes;
	if (nodes.length > 0) {
		let i = nodes.length;
		while (--i >= 0) {
			const child: any = nodes[i];
			if (child.tagName === 'PAGE-FRAME') {
				child.dataValue = child.getAttribute('value');
			} else {
				el.removeChild(child);
			}
		}
	}
}

export function createPageManager(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'page-manager';
	attachPageManagerApi(el);
	return el;
}
