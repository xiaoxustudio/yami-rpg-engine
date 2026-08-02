import { radioProxyMap, createRadioProxy, type RadioProxyElement } from './radio-proxy.ts';
import { on, hasClass } from '@/util/element-utils.ts';

export interface RadioBoxElement extends HTMLElement {
	proxy: RadioProxyElement;
	dataValue: number | string | boolean;
	read(): any;
	write(value: any): void;
	input(value: any): void;
	enable(): void;
	disable(): void;
	relate(entries: any[]): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachRadioBoxApi(el: HTMLElement): void {
	const box = el as RadioBoxElement;
	let proxy = radioProxyMap[box.name] as RadioProxyElement;
	let isNewProxy = false;
	if (proxy === undefined) {
		proxy = createRadioProxy() as RadioProxyElement;
		proxy.id = box.name;
		proxy.style.display = 'none';
		radioProxyMap[proxy.id] = proxy;
		isNewProxy = true;
	}
	box.proxy = proxy;
	box.dataValue = '';

	const string = box.getAttribute('value') ?? '';
	const isNumber = RegExp.number.test(string);
	const value = isNumber
		? parseFloat(string)
		: string === 'false'
			? false
			: string === 'true'
				? true
				: string;
	box.dataValue = value;

	if (box.name && box.proxy.id !== box.name) {
		const existing = radioProxyMap[box.name] as RadioProxyElement;
		if (existing) {
			box.proxy = existing;
			isNewProxy = false;
		} else if (box.proxy.id === '') {
			delete radioProxyMap[''];
			box.proxy.id = box.name;
			radioProxyMap[box.name] = box.proxy;
			isNewProxy = true;
		} else {
			box.proxy = createRadioProxy() as RadioProxyElement;
			box.proxy.id = box.name;
			box.proxy.style.display = 'none';
			radioProxyMap[box.name] = box.proxy;
			isNewProxy = true;
		}
	}
	if (isNewProxy) {
		box.appendChild(box.proxy);
	}

	const pointerdown = (event: PointerEvent): void => {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'selected')) {
					if (document.activeElement !== document.body) {
						document.activeElement.blur();
					}
					box.proxy.input(box.dataValue);
				} else if (box.proxy.cancelable) {
					if (document.activeElement !== document.body) {
						document.activeElement.blur();
					}
					box.proxy.reset();
				}
				break;
		}
	};

	const mouseclick = (event: Event): void => {
		if (!hasClass(box, 'selected')) {
			box.proxy.input(box.dataValue);
		} else if (box.proxy.cancelable) {
			box.proxy.reset();
		}
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey && !hasClass(box, 'disabled')) {
					event.stopPropagation();
					mouseclick(event);
				}
				break;
		}
	};

	on(box, 'keydown', keydown);

	let mark: HTMLElement | null = null;
	switch (hasClass(box, 'standard')) {
		case true: {
			mark = document.createElement('radio-mark');
			on(box, 'click', mouseclick);
			break;
		}
		case false:
			on(box, 'pointerdown', pointerdown);
			break;
	}

	if (mark) {
		box.tabIndex = 0;
		box.insertBefore(mark, box.childNodes[0]);
	}
}

export function createRadioBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'radio-box';
	attachRadioBoxApi(el);
	return el;
}
