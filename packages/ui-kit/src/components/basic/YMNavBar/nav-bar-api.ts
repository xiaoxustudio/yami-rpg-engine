import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { addClass, parseNumberOrString, removeClass, hasClass } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

export interface NavBarApi extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	unselect(...args: unknown[]): void;
	pointerdown(event: PointerEvent): void;
	on(...args: unknown[]): void;
}

interface NavItemData {
	dataValue?: unknown;
}

const navItemData = (el: unknown): NavItemData => elementDataOf<NavItemData>(el);

const parseValue = (element: HTMLElement & { dataValue?: unknown }): unknown => {
	const data = navItemData(element);
	if (data.dataValue === undefined) {
		const string = element.getAttribute('value') ?? '';
		data.dataValue = parseNumberOrString(string);
	}
	return data.dataValue;
};

export function attachNavBarApi(el: HTMLElement): NavBarApi {
	const nav = el as NavBarApi;
	if (isApiAttached(nav)) return nav;

	nav.writeEventEnabled = false;
	nav.selectEventEnabled = false;

	let current: unknown;

	const emitValueEvent = (type: string, value: unknown): void => {
		const event = createPayloadEvent(type, {} as { value: unknown });
		event.value = value;
		el.dispatchEvent(event);
	};

	nav.on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener, listenerOptions);
		switch (type) {
			case 'write':
				nav.writeEventEnabled = true;
				break;
			case 'select':
				nav.selectEventEnabled = true;
				break;
		}
	};

	nav.read = function (): unknown {
		const item = el.querySelector('.selected') as (HTMLElement & { dataValue: unknown }) | null;
		if (item) {
			const data = navItemData(item);
			if (data.dataValue === undefined && hasClass(item, 'nav-item')) {
				parseValue(item);
			}
			return data.dataValue;
		}
		return undefined;
	};

	nav.write = function (value: unknown): void {
		current = value;
		const items = el.childNodes;
		const length = items.length;
		if (length !== 0) {
			nav.unselect();
			let target: HTMLElement | undefined;
			for (let i = 0; i < length; i++) {
				const item = items[i] as HTMLElement & { dataValue: unknown };
				const data = navItemData(item);
				if (hasClass(item, 'nav-item') && data.dataValue === undefined) {
					parseValue(item);
				}
				if (data.dataValue === value) {
					target = item;
					break;
				}
			}
			if (target !== undefined) {
				addClass(target, 'selected');
			}
			if (nav.writeEventEnabled) {
				emitValueEvent('write', target ? value : undefined);
			}
		}
	};

	nav.unselect = function (): void {
		for (const item of Array.from(el.querySelectorAll('.selected'))) {
			removeClass(item, 'selected');
		}
	};

	nav.pointerdown = function (event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement & { dataValue: unknown };
				if (hasClass(element, 'nav-item') && !hasClass(element, 'selected')) {
					const data = navItemData(element);
					nav.write(parseValue(element));
					if (nav.selectEventEnabled) {
						emitValueEvent('select', data.dataValue);
					}
				}
				break;
			}
		}
	};

	el.addEventListener('pointerdown', (event) => nav.pointerdown(event as PointerEvent));

	const elements = el.childNodes;
	if (elements.length > 0) {
		let i = elements.length;
		while (--i >= 0) {
			const element = elements[i] as HTMLElement & { dataValue: unknown };
			if (hasClass(element, 'nav-item')) {
				parseValue(element);
			} else {
				el.removeChild(element);
			}
		}
	}

	new MutationObserver(() => {
		if (current !== undefined) nav.write(current);
	}).observe(el, { childList: true });

	markApiAttached(nav);
	return nav;
}

export function createNavBarElement(): NavBarApi {
	const el = document.createElement('div');
	el.className = 'nav-bar';
	return attachNavBarApi(el);
}
