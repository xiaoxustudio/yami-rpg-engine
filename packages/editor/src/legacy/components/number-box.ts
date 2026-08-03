import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	read,
	getFocus
} from '@/util/element-utils.ts';
import { NumberHistory } from './number-history.ts';
import { measureText } from '@/util/dom.ts';

interface NumberBoxElement extends HTMLElement {
	input: HTMLInputElement;
	decimals: number;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_unit: string | null;
	read(): number;
	write(value: any): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
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

export function attachNumberBoxApi(el: HTMLElement, dom?: any): void {
	const box = el as NumberBoxElement;

	const input = document.createElement('input');
	addClass(input, 'number-box-input');
	input.type = 'number';
	input.min = '0';
	input.max = '0';
	input.step = '1';
	input.title = '';
	input.history = new NumberHistory(input);
	on(input, 'keydown', inputKeydown);
	on(input, 'change', () => {
		input.value = String(read(box));
	});

	const src = dom instanceof HTMLElement ? dom : el;
	const min = src.getAttribute('min') ?? '0';
	const max = src.getAttribute('max') ?? '0';
	const step = src.getAttribute('step') ?? '1';
	const unit = src.getAttribute('unit');
	const decimals = parseInt(src.getAttribute('decimals')) || 0;

	input.min = min;
	input.max = max;
	input.step = step;

	box.input = input;
	box.decimals = decimals;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;
	box._unit = unit;

	el.appendChild(input);

	if (el.childNodes.length > 1) {
		const label = el.childNodes[0].textContent;
		const font = 'var(--font-family-mono)';
		const padding = measureText(label, font).width + 8;
		input.style.paddingLeft = `${padding}px`;
	}

	if (unit !== null) {
		const unitText = document.createElement('div');
		const font = 'var(--font-family-mono)';
		const padding = measureText(unit, font).width + 8;
		addClass(unitText, 'unit');
		addClass(unitText, 'text');
		unitText.textContent = unit;
		el.insertBefore(unitText, input);
		input.style.paddingRight = `${padding}px`;
	}

	box.read = function (): number {
		const min = parseFloat(input.min);
		const max = parseFloat(input.max);
		let value = parseFloat(input.value) || 0;
		value = Math.clamp(value, min, max);
		value = Math.roundTo(value, box.decimals);
		return value;
	};

	box.write = function (value: any): void {
		input.value = String(value);
		input.value = String(read(box));
		input.history.reset();
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
		options?: boolean | AddEventListenerOptions
	): void {
		el.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'focus':
				if (!box.focusEventEnabled) {
					box.focusEventEnabled = true;
					on(input, 'focus', () => {
						el.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!box.blurEventEnabled) {
					box.blurEventEnabled = true;
					on(input, 'blur', () => {
						el.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};
}

export function createNumberBox(dom?: any): HTMLElement {
	const el = document.createElement('div');
	el.className = 'number-box';
	attachNumberBoxApi(el, dom);
	return el;
}
