import { show, hide } from '../../../utils/dom';

export interface DetailBoxApi extends HTMLElement {
	_initialized: boolean;
	toggle(): void;
	open(): void;
	close(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachDetailBoxApi(el: HTMLElement): DetailBoxApi {
	const box = el as DetailBoxApi;
	if (box._initialized) return box;
	let toggleEventEnabled = false;

	const isSummary = (node: Element): boolean =>
		node.classList.contains('detail-summary') ||
		node.tagName.toLowerCase() === 'detail-summary';

	const apply = (open: boolean): void => {
		for (const node of box.children) {
			if (!isSummary(node)) {
				if (open) {
					show(node as HTMLElement);
				} else {
					hide(node as HTMLElement);
				}
			}
		}
	};

	box.open = function (): void {
		if (!box.hasAttribute('open')) {
			box.setAttribute('open', '');
			apply(true);
			if (toggleEventEnabled) {
				const toggle = new Event('toggle') as Event & { value: string };
				toggle.value = 'open';
				box.dispatchEvent(toggle);
			}
		}
	};

	box.close = function (): void {
		if (box.hasAttribute('open')) {
			box.removeAttribute('open');
			apply(false);
			if (toggleEventEnabled) {
				const toggle = new Event('toggle') as Event & { value: string };
				toggle.value = 'closed';
				box.dispatchEvent(toggle);
			}
		}
	};

	box.toggle = function (): void {
		if (box.hasAttribute('open')) {
			box.close();
		} else {
			box.open();
		}
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		if (type === 'toggle') {
			toggleEventEnabled = true;
		}
	};

	box._initialized = true;

	if (box.hasAttribute('open')) {
		apply(true);
	} else {
		apply(false);
	}

	return box;
}

export function createDetailBoxElement(): DetailBoxApi {
	const el = document.createElement('div');
	el.className = 'detail-box';
	el.setAttribute('open', '');
	return attachDetailBoxApi(el);
}
