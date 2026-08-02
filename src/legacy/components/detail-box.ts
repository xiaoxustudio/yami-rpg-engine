import { show, hide } from '@/util/element-utils.ts';

interface DetailBoxElement extends HTMLElement {
	toggle(): void;
	open(): void;
	close(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachDetailBoxApi(el: HTMLElement): void {
	const box = el as DetailBoxElement;
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
				const toggle = new Event('toggle');
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
				const toggle = new Event('toggle');
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
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, options);
		if (type === 'toggle') {
			toggleEventEnabled = true;
		}
	};

	if (box.hasAttribute('open')) {
		apply(true);
	} else {
		apply(false);
	}
}

export function createDetailBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'detail-box';
	el.setAttribute('open', '');
	attachDetailBoxApi(el);
	return el;
}
