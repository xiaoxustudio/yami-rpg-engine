import { isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';
import { show, hide } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

export interface DetailBoxApi extends HTMLElement {
	toggle(): void;
	open(...args: unknown[]): void;
	close(...args: unknown[]): void;
	on(...args: unknown[]): void;
}

export function attachDetailBoxApi(el: HTMLElement): DetailBoxApi {
	const box = el as DetailBoxApi;
	if (isApiAttached(box)) return box;
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

	const open = function (): void {
		if (!box.hasAttribute('open')) {
			box.setAttribute('open', '');
			apply(true);
			if (toggleEventEnabled) {
				const toggle = createPayloadEvent('toggle', {} as { value: string });
				toggle.value = 'open';
				box.dispatchEvent(toggle);
			}
		}
	};

	const close = function (): void {
		if (box.hasAttribute('open')) {
			box.removeAttribute('open');
			apply(false);
			if (toggleEventEnabled) {
				const toggle = createPayloadEvent('toggle', {} as { value: string });
				toggle.value = 'closed';
				box.dispatchEvent(toggle);
			}
		}
	};

	const toggle = function (): void {
		if (box.hasAttribute('open')) {
			box.close();
		} else {
			box.open();
		}
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		if (type === 'toggle') {
			toggleEventEnabled = true;
		}
	};

	attachApi(box, { open, close, toggle, on });

	markApiAttached(box);

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
