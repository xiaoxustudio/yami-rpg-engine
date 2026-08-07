import { addClass, removeClass, read } from '../../../utils/dom';
import { NumberHistory } from '../../../utils/history';

export interface NumberBoxApiOptions {
	dom?: HTMLElement | null;
	min?: string;
	max?: string;
	step?: string;
	unit?: string | null;
	decimals?: number;
	modelValue?: any;
	disabled?: boolean;
	measureText?: ((text: string, font?: string) => { width: number }) | null;
}

export interface NumberBoxApi extends HTMLElement {
	input?: HTMLInputElement;
	decimals: number;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_unit: string | null;
	_initialized: boolean;
	read(...args: unknown[]): any;
	write(...args: unknown[]): any;
	enable(...args: unknown[]): any;
	disable(...args: unknown[]): any;
	getFocus(mode: any): void;
	on(...args: unknown[]): any;
}

const whiteList = new Set([
	'Digit0',
	'Digit1',
	'Digit2',
	'Digit3',
	'Digit4',
	'Digit5',
	'Digit6',
	'Digit7',
	'Digit8',
	'Digit9',
	'Minus',
	'Period',
	'Numpad0',
	'Numpad1',
	'Numpad2',
	'Numpad3',
	'Numpad4',
	'Numpad5',
	'Numpad6',
	'Numpad7',
	'Numpad8',
	'Numpad9',
	'NumpadSubtract',
	'NumpadDecimal',
	'Backspace',
	'Delete',
	'Tab',
	'Enter',
	'ArrowLeft',
	'ArrowUp',
	'ArrowRight',
	'ArrowDown',
	'Home',
	'End',
	'NumpadEnter'
]);

const inputKeydown = function (event: any): void {
	!whiteList.has(event.code) && !event.cmdOrCtrlKey && event.preventDefault();
};

const clamp = (value: number, min: number, max: number): number =>
	Math.min(Math.max(value, min), max);

const roundTo = (value: number, decimals: number): number => {
	const factor = Math.pow(10, decimals);
	return Math.round(value * factor) / factor;
};

const showChildNodes = (el: HTMLElement): void => {
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = '';
	}
};

const hideChildNodes = (el: HTMLElement): void => {
	for (const child of Array.from(el.children)) {
		(child as HTMLElement).style.display = 'none';
	}
};

const getFocus = (input: HTMLInputElement, mode: any): void => {
	setTimeout(() => {
		input.focus();
		switch (mode) {
			case 'all':
				input.select();
				break;
			case 'end':
				if (typeof input.selectionStart === 'number') {
					input.setSelectionRange(input.value.length, input.value.length);
				}
				break;
		}
	});
};

export function attachNumberBoxApi(
	el: HTMLElement,
	options: NumberBoxApiOptions = {}
): NumberBoxApi {
	const box = el as NumberBoxApi;
	if (box._initialized) return box;

	const input = document.createElement('input');
	addClass(input, 'number-box-input');
	input.type = 'number';
	input.min = '0';
	input.max = '0';
	input.step = '1';
	input.title = '';
	(input as any).history = new NumberHistory(input);
	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('change', () => {
		input.value = String(read(box));
	});

	const src = options.dom instanceof HTMLElement ? options.dom : el;
	const min = options.min ?? src.getAttribute('min') ?? '0';
	const max = options.max ?? src.getAttribute('max') ?? '0';
	const step = options.step ?? src.getAttribute('step') ?? '1';
	const unit = options.unit !== undefined ? options.unit : src.getAttribute('unit');
	const decimals = options.decimals ?? (parseInt(src.getAttribute('decimals') ?? '') || 0);

	input.min = min;
	input.max = max;
	input.step = step;

	box.input = input;
	box.decimals = decimals;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;
	box._unit = unit;

	el.appendChild(input);

	const measure = options.measureText ?? null;
	if (el.childNodes.length > 1) {
		const label = el.childNodes[0]?.textContent ?? '';
		const font = 'var(--font-family-mono)';
		const padding = (measure ? measure(label, font).width : label.length * 8) + 8;
		input.style.paddingLeft = `${padding}px`;
	}

	if (unit !== null) {
		const unitText = document.createElement('div');
		const font = 'var(--font-family-mono)';
		const padding = (measure ? measure(unit, font).width : unit.length * 8) + 8;
		addClass(unitText, 'unit');
		addClass(unitText, 'text');
		unitText.textContent = unit;
		el.insertBefore(unitText, input);
		input.style.paddingRight = `${padding}px`;
	}

	box.read = function (): number {
		const minValue = parseFloat(input.min);
		const maxValue = parseFloat(input.max);
		let value = parseFloat(input.value) || 0;
		value = clamp(value, minValue, maxValue);
		value = roundTo(value, box.decimals);
		return value;
	};

	box.write = function (value: any): void {
		input.value = String(value);
		input.value = String(read(box));
		(input as any).history.reset();
	};

	box.enable = function (): void {
		if (removeClass(el, 'disabled')) {
			showChildNodes(el);
		}
	};

	box.disable = function (): void {
		if (addClass(el, 'disabled')) {
			hideChildNodes(el);
		}
	};

	box.getFocus = function (mode: any): void {
		getFocus(input, mode);
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'focus':
				if (!box.focusEventEnabled) {
					box.focusEventEnabled = true;
					input.addEventListener('focus', () => {
						el.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!box.blurEventEnabled) {
					box.blurEventEnabled = true;
					input.addEventListener('blur', () => {
						el.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};

	box._initialized = true;

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createNumberBoxElement(options?: NumberBoxApiOptions): NumberBoxApi {
	const el = document.createElement('div');
	el.className = 'number-box';
	return attachNumberBoxApi(el, options);
}
