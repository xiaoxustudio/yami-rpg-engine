import { addClass, removeClass, hasClass } from '../../../utils/dom';

export interface NavBarApi extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	_initialized: boolean;
	read(...args: unknown[]): any;
	write(...args: unknown[]): any;
	unselect(...args: unknown[]): any;
	pointerdown(event: PointerEvent): void;
	on(...args: unknown[]): any;
}

const numberRegex = /^-?\d+(?:\.\d+)?$/;

const parseValue = (element: any): any => {
	if (element.dataValue === undefined) {
		const string = element.getAttribute('value') ?? '';
		const isNumber = numberRegex.test(string);
		element.dataValue = isNumber ? parseFloat(string) : string;
	}
	return element.dataValue;
};

export function attachNavBarApi(el: HTMLElement): NavBarApi {
	const nav = el as NavBarApi;
	if (nav._initialized) return nav;

	nav.writeEventEnabled = false;
	nav.selectEventEnabled = false;

	nav.on = function (
		type: string,
		listener: (event: any) => void,
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

	nav.read = function (): any {
		const item = el.querySelector('.selected') as (HTMLElement & { dataValue: any }) | null;
		if (item && item.dataValue === undefined && hasClass(item, 'nav-item')) {
			parseValue(item);
		}
		return item ? item.dataValue : undefined;
	};

	nav.write = function (value: any): void {
		const items = el.childNodes;
		const length = items.length;
		if (length !== 0) {
			nav.unselect();
			let target: HTMLElement | undefined;
			for (let i = 0; i < length; i++) {
				const item = items[i] as HTMLElement & { dataValue: any };
				if (hasClass(item, 'nav-item') && item.dataValue === undefined) {
					parseValue(item);
				}
				if (item.dataValue === value) {
					target = item;
					break;
				}
			}
			if (target !== undefined) {
				addClass(target, 'selected');
			}
			if (nav.writeEventEnabled) {
				const write: any = new Event('write');
				write.value = target ? value : undefined;
				el.dispatchEvent(write);
			}
		}
	};

	nav.unselect = function (): void {
		const item = el.querySelector('.selected');
		if (item) {
			removeClass(item as HTMLElement, 'selected');
		}
	};

	nav.pointerdown = function (event: PointerEvent): void {
		switch (event.button) {
			case 0: {
				const element = event.target as HTMLElement & { dataValue: any };
				if (hasClass(element, 'nav-item') && !hasClass(element, 'selected')) {
					nav.write(parseValue(element));
					if (nav.selectEventEnabled) {
						const select = new Event('select') as Event & { value: any };
						select.value = element.dataValue;
						el.dispatchEvent(select);
					}
				}
				break;
			}
		}
	};

	el.addEventListener('pointerdown', nav.pointerdown as EventListener);

	const elements = el.childNodes;
	if (elements.length > 0) {
		let i = elements.length;
		while (--i >= 0) {
			const element = elements[i] as HTMLElement & { dataValue: any };
			if (hasClass(element, 'nav-item')) {
				parseValue(element);
			} else {
				el.removeChild(element);
			}
		}
	}

	nav._initialized = true;
	return nav;
}

export function createNavBarElement(): NavBarApi {
	const el = document.createElement('div');
	el.className = 'nav-bar';
	return attachNavBarApi(el);
}
