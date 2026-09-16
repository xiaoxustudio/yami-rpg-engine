import { attachApi } from '../../../utils/attach-api';
import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
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
	modelValue?: number | string | boolean;
	disabled?: boolean;
	cancelable?: boolean;
}

export type RadioBoxApi = HTMLElement & {
	name: string;
	proxy: RadioProxyElement;
	dataValue: number | string | boolean;
	read(...args: unknown[]): number | string | boolean;
	write(...args: unknown[]): void;
	input(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	relate(...args: unknown[]): void;
	on(...args: unknown[]): void;
};

export function attachRadioBoxApi(el: HTMLElement, options: RadioBoxApiOptions = {}): RadioBoxApi {
	const box = el as unknown as RadioBoxApi;
	if (isApiAttached(box)) return box;
	// P4b: proxy now lives in element data (field removed from DATA_FIELDS)
	const data = elementDataOf<RadioBoxApi>(box);

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
	data.proxy = proxy;
	let dataValue: unknown = '';
	Object.defineProperty(box, 'dataValue', {
		configurable: true,
		get: () => dataValue,
		set: (value: unknown) => {
			dataValue = value;
		}
	});

	const string = box.getAttribute('value') ?? '';
	const isNumber = /^-?\d+(?:\.\d+)?$/.test(string);
	const value = isNumber
		? parseFloat(string)
		: string === 'false'
			? false
			: string === 'true'
				? true
				: string;
	dataValue = value;

	if (boxName && data.proxy?.id !== boxName) {
		const existing = radioProxyMap[boxName] as RadioProxyElement;
		if (existing) {
			data.proxy = existing;
			isNewProxy = false;
		} else if (data.proxy!.id === '') {
			delete radioProxyMap[''];
			data.proxy!.id = boxName;
			radioProxyMap[boxName] = data.proxy;
			isNewProxy = true;
		} else {
			data.proxy = createRadioProxy() as RadioProxyElement;
			data.proxy!.id = boxName;
			data.proxy!.style.display = 'none';
			radioProxyMap[boxName] = data.proxy;
			isNewProxy = true;
		}
	}
	if (isNewProxy) {
		box.appendChild(data.proxy!);
	}

	const pointerdown = (event: PointerEvent): void => {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'selected')) {
					if (document.activeElement !== document.body) {
						(document.activeElement as HTMLElement).blur();
					}
					data.proxy?.input(box.dataValue);
				} else if (data.proxy?.cancelable) {
					if (document.activeElement !== document.body) {
						(document.activeElement as HTMLElement).blur();
					}
					data.proxy?.reset();
				}
				break;
		}
	};

	const mouseclick = (_event: Event): void => {
		if (!hasClass(box, 'selected')) {
			data.proxy?.input(box.dataValue);
		} else if (data.proxy?.cancelable) {
			data.proxy?.reset();
		}
	};

	const keydown = (event: KeyboardEvent): void => {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (
					!(event as KeyboardEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey &&
					!hasClass(box, 'disabled')
				) {
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

	markApiAttached(box);

	const read = (): number | string | boolean => box.dataValue;
	const write = (v: number | string | boolean): void => {
		box.dataValue = v;
	};
	const input = (v: unknown): void => {
		data.proxy?.input(v);
	};
	const enable = (): void => {
		box.classList.remove('disabled');
	};
	const disable = (): void => {
		box.classList.add('disabled');
	};
	const relate = (entries: unknown[]): void => {
		data.proxy?.relate(entries);
	};
	const on = (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void => {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	attachApi(box, { read, write, input, enable, disable, relate, on });

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
