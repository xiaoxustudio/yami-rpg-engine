import { TextHistory } from './text-history.ts';
import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus,
	listenDraggingScrollbarEvent
} from '@/util/element-utils.ts';
import { Timer } from '@/util/timer.ts';
import { macInputKeydown } from './text-box.ts';

interface TextAreaElement extends HTMLElement {
	input: HTMLTextAreaElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

let target: HTMLElement | null = null;

const timer = new Timer({
	duration: 0,
	callback: () => {
		removeClass(target, 'inputting');
		target = null;
	}
});

export function attachTextAreaApi(el: HTMLElement): void {
	const box = el as TextAreaElement;

	const input = document.createElement('textarea');
	input.history = new TextHistory(input);
	on(input, 'keydown', inputKeydown);
	on(input, 'input', inputInput);
	listenDraggingScrollbarEvent(input);

	box.input = input;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;

	if (process.platform === 'darwin') {
		on(input, 'keydown', macInputKeydown as (event: EditorEvent) => void);
	}

	el.appendChild(input);

	box.read = function (): string {
		return input.value;
	};

	box.write = function (value: string): void {
		input.value = value;
		input.history.reset();
	};

	box.insert = function (value: string): void {
		input.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: value,
				bubbles: true
			})
		);
		document.execCommand('insertText', false, value);
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

	function inputKeydown(event: any): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
				}
				break;
		}
		if (!target) {
			target = el;
			timer.add();
			addClass(el, 'inputting');
		}
	}

	function inputInput(event: any): void {
		if (!target) {
			target = el;
			timer.add();
			addClass(el, 'inputting');
		}
	}
}

export function createTextArea(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'text-area';
	attachTextAreaApi(el);
	return el;
}
