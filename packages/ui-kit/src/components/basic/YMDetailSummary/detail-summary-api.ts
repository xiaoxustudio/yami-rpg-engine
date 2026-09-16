import { isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';

export interface DetailSummaryApi extends HTMLElement {
	toggle(): void;
	on(...args: unknown[]): void;
}

export function attachDetailSummaryApi(el: HTMLElement): DetailSummaryApi {
	const summary = el as DetailSummaryApi;
	if (isApiAttached(summary)) return summary;

	const findBox = (node: Element): (HTMLElement & { toggle?: () => void }) | null => {
		let parent = node.parentElement;
		while (parent) {
			if (
				parent.classList.contains('detail-box') ||
				parent.tagName.toLowerCase() === 'detail-box'
			) {
				return parent;
			}
			parent = parent.parentElement;
		}
		return null;
	};

	const toggle = (): void => {
		const parent =
			(summary.closest('.detail-box') as (HTMLElement & { toggle?: () => void }) | null) ??
			findBox(summary);
		parent?.toggle?.();
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (
					!(event as KeyboardEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey &&
					!event.altKey
				) {
					toggle();
				}
				break;
		}
	};

	const pointerdown = (event: PointerEvent): void => {
		if (event.button === 0 && event.target === summary) {
			toggle();
		}
	};

	attachApi(summary, {
		toggle,
		on: (
			type: string,
			listener: (event: Event) => void,
			listenerOptions?: boolean | AddEventListenerOptions
		): void => {
			summary.addEventListener(type, listener as EventListener, listenerOptions);
		}
	});

	markApiAttached(summary);
	summary.addEventListener('keydown', keydown);
	summary.addEventListener('pointerdown', pointerdown);

	return summary;
}

export function createDetailSummaryElement(): DetailSummaryApi {
	const el = document.createElement('div');
	el.className = 'detail-summary';
	return attachDetailSummaryApi(el);
}
