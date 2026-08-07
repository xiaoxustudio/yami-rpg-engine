import { addClass, hasClass } from '../../../utils/dom';
import {
	radioProxyMap,
	createRadioProxy,
	type RadioProxyElement
} from '../../../utils/radio-proxy';

export interface RadioBoxApiOptions {
	name?: string;
	value?: string;
	standard?: boolean;
	modelValue?: any;
	disabled?: boolean;
	cancelable?: boolean;
}

export interface RadioBoxApi extends HTMLElement {
	name: string;
	proxy: RadioProxyElement;
	dataValue: number | string | boolean;
	_initialized: boolean;
	read(...args: unknown[]): any;
	write(...args: unknown[]): any;
	input(...args: unknown[]): any;
	enable(...args: unknown[]): any;
	disable(...args: unknown[]): any;
	relate(...args: unknown[]): any;
	on(...args: unknown[]): any;
}

export function attachRadioBoxApi(el: HTMLElement, options: RadioBoxApiOptions = {}): RadioBoxApi {
	const box = el as unknown as RadioBoxApi;
	if (box._initialized) return box;

	if (options.name) box.setAttribute('name', options.name);
	if (options.value) box.setAttribute('value', options.value);

	const boxName = box.getAttribute('name') ?? '';
	let proxy = radioProxyMap[boxName] as RadioProxyElement;
	let isNewProxy = false;
	if (proxy === undefined) {
		proxy = createRadioProxy() as RadioProxyElement;
		proxy.id = boxName;
		proxy.style.display = 'none';
		radioProxyMap[proxy.id] = proxy;
		isNewProxy = true;
	}
	box.proxy = proxy;
	box.dataValue = '';

	const string = box.getAttribute('value') ?? '';
	const isNumber = /^-?\d+(?:\.\d+)?$/.test(string);
	const value = isNumber
		? parseFloat(string)
		: string === 'false'
			? false
			: string === 'true'
				? true
				: string;
	box.dataValue = value;

	if (boxName && box.proxy?.id !== boxName) {
		const existing = radioProxyMap[boxName] as RadioProxyElement;
		if (existing) {
			box.proxy = existing;
			isNewProxy = false;
		} else if (box.proxy!.id === '') {
			delete radioProxyMap[''];
			box.proxy!.id = boxName;
			radioProxyMap[boxName] = box.proxy;
			isNewProxy = true;
		} else {
			box.proxy = createRadioProxy() as RadioProxyElement;
			box.proxy!.id = boxName;
			box.proxy!.style.display = 'none';
			radioProxyMap[boxName] = box.proxy;
			isNewProxy = true;
		}
	}
	if (isNewProxy) {
		box.appendChild(box.proxy!);
	}

	const pointerdown = (event: PointerEvent): void => {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'selected')) {
					if (document.activeElement !== document.body) {
						(document.activeElement as HTMLElement).blur();
					}
					box.proxy?.input(box.dataValue);
				} else if (box.proxy?.cancelable) {
					if (document.activeElement !== document.body) {
						(document.activeElement as HTMLElement).blur();
					}
					box.proxy?.reset();
				}
				break;
		}
	};

	const mouseclick = (event: Event): void => {
		if (!hasClass(box, 'selected')) {
			box.proxy?.input(box.dataValue);
		} else if (box.proxy?.cancelable) {
			box.proxy?.reset();
		}
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!(event as any).cmdOrCtrlKey && !hasClass(box, 'disabled')) {
					event.stopPropagation();
					mouseclick(event);
				}
				break;
		}
	};

	box.addEventListener('keydown', keydown as EventListener);

	let mark: HTMLElement | null = null;
	switch (hasClass(box, 'standard') || options.standard) {
		case true: {
			mark = document.createElement('span');
			addClass(mark, 'radio-mark');
			box.addEventListener('click', mouseclick);
			break;
		}
		case false:
			box.addEventListener('pointerdown', pointerdown as EventListener);
			break;
	}

	if (mark) {
		box.tabIndex = 0;
		box.insertBefore(mark, box.childNodes[0]);
	}

	box._initialized = true;

	box.read = () => box.dataValue;
	box.write = (v: any) => {
		box.dataValue = v;
	};
	box.input = (v: any) => {
		box.proxy?.input(v);
	};
	box.enable = () => {
		box.classList.remove('disabled');
	};
	box.disable = () => {
		box.classList.add('disabled');
	};
	box.relate = (entries: any[]) => {
		box.proxy?.relate(entries);
	};
	box.on = (
		type: string,
		listener: (event: any) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void => {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createRadioBoxElement(options?: RadioBoxApiOptions): RadioBoxApi {
	const el = document.createElement('div');
	el.className = 'radio-box';
	if (options?.standard) addClass(el, 'standard');
	return attachRadioBoxApi(el, options);
}
