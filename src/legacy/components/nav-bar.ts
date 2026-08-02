import { on, addClass, removeClass, hasClass } from '@/util/element-utils.ts';

interface NavBarElement extends HTMLElement {
	writeEventEnabled: boolean;
	selectEventEnabled: boolean;
	read(): any;
	write(value: any): void;
	unselect(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	pointerdown: (event: PointerEvent) => void;
}

export function attachNavBarApi(el: HTMLElement): void {
	const nav = el as NavBarElement;

	nav.writeEventEnabled = false;
	nav.selectEventEnabled = false;

	nav.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener, options);
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
			const string = item.getAttribute('value') ?? '';
			const isNumber = RegExp.number.test(string);
			item.dataValue = isNumber ? parseFloat(string) : string;
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
					const string = item.getAttribute('value') ?? '';
					const isNumber = RegExp.number.test(string);
					item.dataValue = isNumber ? parseFloat(string) : string;
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
					if (element.dataValue === undefined) {
						const string = element.getAttribute('value') ?? '';
						const isNumber = RegExp.number.test(string);
						element.dataValue = isNumber ? parseFloat(string) : string;
					}
					nav.write(element.dataValue);
					if (nav.selectEventEnabled) {
						const select = new Event('select');
						select.value = element.dataValue;
						el.dispatchEvent(select);
					}
				}
				break;
			}
		}
	};

	on(el, 'pointerdown', nav.pointerdown);

	const elements = el.childNodes;
	if (elements.length > 0) {
		let i = elements.length;
		while (--i >= 0) {
			const element = elements[i] as HTMLElement & { dataValue: any };
			if (hasClass(element, 'nav-item')) {
				const string = element.getAttribute('value') ?? '';
				const isNumber = RegExp.number.test(string);
				element.dataValue = isNumber ? parseFloat(string) : string;
			} else {
				el.removeChild(element);
			}
		}
	}
}

export function createNavBar(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'nav-bar';
	attachNavBarApi(el);
	return el;
}
