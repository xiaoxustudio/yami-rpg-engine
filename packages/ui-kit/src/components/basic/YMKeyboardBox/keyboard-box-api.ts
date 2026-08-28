/* oxlint-disable eslint/no-restricted-properties */
import { attachApi } from '../../../utils/attach-api';
import { addClass, removeClass, dispatchChangeEvent } from '../../../utils/dom';

export interface KeyboardBoxApiOptions {
	modelValue?: number;
	disabled?: boolean;
}

export interface KeyboardBoxApi extends HTMLElement {
	input?: HTMLInputElement;
	dataValue: number | null;
	inputEventEnabled: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	inputCode(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(...args: unknown[]): void;
	on(...args: unknown[]): void;
}

const codeToKey = (code: string): string => {
	if (code.startsWith('Key')) return code.slice(3);
	if (code.startsWith('Digit')) return code.slice(5);
	if (code.startsWith('Numpad')) return code.slice(6);
	if (code.startsWith('Arrow')) return code.slice(5);
	return code;
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

export function attachKeyboardBoxApi(
	el: HTMLElement,
	options: KeyboardBoxApiOptions = {}
): KeyboardBoxApi {
	const box = el as unknown as KeyboardBoxApi;
	if (box._initialized) return box;

	const input = document.createElement('input');
	addClass(input, 'keyboard-box-input');
	input.type = 'text';
	input.addEventListener('keydown', (event: KeyboardEvent) => {
		event.stopPropagation();
		event.preventDefault();
		switch (event.code) {
			case 'Backspace':
				box.inputCode(0);
				break;
			case 'Enter':
			case 'NumpadEnter':
				event.stopImmediatePropagation();
				break;
			default:
				box.inputCode((event as KeyboardEvent & { keyCode?: number }).keyCode || 0);
				input.value = codeToKey(event.code);
				break;
		}
	});

	box.input = input;
	let dataValue = 0;
	Object.defineProperty(box, 'dataValue', {
		configurable: true,
		get: () => dataValue,
		set: (value: number) => {
			dataValue = value;
		}
	});
	box.inputEventEnabled = false;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;
	el.appendChild(input);

	const read = function (): number {
		return box.dataValue ?? 0;
	};

	const write = function (code: number): void {
		box.dataValue = code;
		box.input!.value = String(code);
	};

	const inputCode = function (code: number): void {
		if (box.dataValue !== code) {
			box.write(code);
			if (box.inputEventEnabled) {
				const inputEvent = new InputEvent('input') as InputEvent & {
					value: number;
				};
				inputEvent.value = box.dataValue ?? 0;
				box.dispatchEvent(inputEvent);
			}
			dispatchChangeEvent(box);
		}
	};

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			showChildNodes(box);
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			hideChildNodes(box);
		}
	};

	const getFocus = function (mode: string): HTMLInputElement {
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
		return input;
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'input':
				box.inputEventEnabled = true;
				break;
			case 'focus':
				if (!box.focusEventEnabled) {
					box.focusEventEnabled = true;
					input.addEventListener('focus', () => {
						box.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!box.blurEventEnabled) {
					box.blurEventEnabled = true;
					input.addEventListener('blur', () => {
						box.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};

	attachApi(box, { read, write, inputCode, enable, disable, getFocus, on });

	box._initialized = true;

	if (options.modelValue) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createKeyboardBoxElement(options?: KeyboardBoxApiOptions): KeyboardBoxApi {
	const el = document.createElement('div');
	el.className = 'keyboard-box';
	return attachKeyboardBoxApi(el, options);
}
