import { isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';
import { addClass, removeClass } from '../../../utils/dom';
import { TextHistory } from '../../../utils/history';
import { Timer } from '../../../utils/timer';

export interface TextAreaApiOptions {
	disabled?: boolean;
	modelValue?: string;
	listenDraggingScrollbarEvent?: ((el: HTMLTextAreaElement) => void) | null;
}

export interface TextAreaApi extends HTMLElement {
	language: string;
	input?: HTMLTextAreaElement | null;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	read(...args: unknown[]): string;
	write(...args: unknown[]): void;
	insert(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(...args: unknown[]): void;
	on(...args: unknown[]): void;
}

interface HistoryTextAreaElement extends HTMLTextAreaElement {
	history: { reset(): void };
}

let target: HTMLElement | null = null;

const timer = new Timer({
	duration: 0,
	callback: () => {
		removeClass(target, 'inputting');
		target = null;
	}
});

const macInputKeydown = (event: KeyboardEvent): void => {
	if (event.metaKey) {
		switch (event.code) {
			case 'KeyC':
				document.execCommand('copy');
				break;
			case 'KeyV':
				document.execCommand('paste');
				break;
			case 'KeyX':
				document.execCommand('cut');
				break;
		}
	}
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

const getFocus = (input: HTMLTextAreaElement, mode?: string): void => {
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

export function attachTextAreaApi(el: HTMLElement, options: TextAreaApiOptions = {}): TextAreaApi {
	const box = el as TextAreaApi;
	if (isApiAttached(box)) return box;

	const input = document.createElement('textarea');
	(input as HistoryTextAreaElement).history = new TextHistory(input);
	input.addEventListener('keydown', inputKeydown);
	input.addEventListener('input', inputInput);
	options.listenDraggingScrollbarEvent?.(input);

	box.input = input;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;

	if (/Mac|iPhone|iPad/.test(navigator.platform)) {
		input.addEventListener('keydown', macInputKeydown as EventListener);
	}

	el.appendChild(input);

	const read = function (): string {
		return input.value;
	};

	const write = function (value: string): void {
		input.value = value;
		(input as HistoryTextAreaElement).history.reset();
	};

	const insert = function (value: string): void {
		input.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: value,
				bubbles: true
			})
		);
		document.execCommand('insertText', false, value);
	};

	const enable = function (): void {
		if (removeClass(el, 'disabled')) {
			showChildNodes(el);
		}
	};

	const disable = function (): void {
		if (addClass(el, 'disabled')) {
			hideChildNodes(el);
		}
	};

	const focusBox = function (mode?: string): void {
		getFocus(input, mode);
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
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

	attachApi(box, { read, write, insert, enable, disable, getFocus: focusBox, on });

	function inputKeydown(event: KeyboardEvent & { cmdOrCtrlKey?: boolean }): void {
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

	function inputInput(_event: Event): void {
		if (!target) {
			target = el;
			timer.add();
			addClass(el, 'inputting');
		}
	}

	markApiAttached(box);

	if (options.modelValue !== undefined) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createTextAreaElement(options?: TextAreaApiOptions): TextAreaApi {
	const el = document.createElement('div');
	el.className = 'text-area';
	return attachTextAreaApi(el, options);
}
