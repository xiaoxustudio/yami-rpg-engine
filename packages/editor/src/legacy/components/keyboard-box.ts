import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

interface KeyboardBoxElement extends HTMLElement {
	input: HTMLInputElement;
	dataValue: number;
	inputEventEnabled: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	read(): number;
	write(code: number): void;
	inputCode(code: number): void;
	enable(): void;
	disable(): void;
	getFocus(mode: string): HTMLInputElement;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachKeyboardBoxApi(el: HTMLElement): void {
	const box = el as KeyboardBoxElement;
	const input = document.createElement('input');
	addClass(input, 'keyboard-box-input');
	input.type = 'text';
	on(input, 'keydown', (event: KeyboardEvent) => {
		event.stopPropagation();
		event.preventDefault();
		switch (event.code) {
			case 'Backspace':
				box.inputCode(0);
				break;
			case 'Enter':
			case 'NumpadEnter':
				event.stopImmediatePropagation();
			default:
				box.inputCode(parseInt(event.code) || 0);
				break;
		}
	});

	box.input = input;
	box.dataValue = 0;
	box.inputEventEnabled = false;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;
	el.appendChild(input);

	box.read = function (): number {
		return box.dataValue;
	};

	box.write = function (code: number): void {
		box.dataValue = code;
		box.input.value = String(code);
	};

	box.inputCode = function (code: number): void {
		if (box.dataValue !== code) {
			box.write(code);
			if (box.inputEventEnabled) {
				const inputEvent = new InputEvent('input') as InputEvent & {
					value: number;
				};
				inputEvent.value = box.dataValue;
				box.dispatchEvent(inputEvent);
			}
			dispatchChangeEvent(box);
		}
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			showChildNodes(box);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			hideChildNodes(box);
		}
	};

	box.getFocus = function (mode: string): HTMLInputElement {
		return getFocus(box.input, mode) as any;
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener, options);
		switch (type) {
			case 'input':
				box.inputEventEnabled = true;
				break;
			case 'focus':
				if (!box.focusEventEnabled) {
					box.focusEventEnabled = true;
					on(box.input, 'focus', (event: Event) => {
						box.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!box.blurEventEnabled) {
					box.blurEventEnabled = true;
					on(box.input, 'blur', (event: Event) => {
						box.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	};
}

export function createKeyboardBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'keyboard-box';
	attachKeyboardBoxApi(el);
	return el;
}
