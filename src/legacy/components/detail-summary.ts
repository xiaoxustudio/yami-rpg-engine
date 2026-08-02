interface DetailSummaryElement extends HTMLElement {
	toggle(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachDetailSummaryApi(el: HTMLElement): void {
	const summary = el as DetailSummaryElement;

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
				if (!event.cmdOrCtrlKey && !event.altKey) {
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

	summary.toggle = toggle;
	summary.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		summary.addEventListener(type, listener as EventListener, options);
	};

	summary.addEventListener('keydown', keydown);
	summary.addEventListener('pointerdown', pointerdown);
}

export function createDetailSummary(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'detail-summary';
	attachDetailSummaryApi(el);
	return el;
}
