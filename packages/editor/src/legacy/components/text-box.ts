import {
	on,
	addClass,
	removeClass,
	show,
	hide,
	getFocus,
	rect,
	hideChildNodes,
	showChildNodes
} from '@/util/element-utils.ts';
import { TextHistory } from './text-history.ts';

interface TextBoxElement extends HTMLElement {
	input: HTMLInputElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	lastText: string;
	hiddenNodes: any[];
	closeButton: HTMLElement | null;
	read(): string;
	write(value: string): void;
	insert(value: string): void;
	enable(): void;
	disable(): void;
	focus(): void;
	getFocus(mode: string | null): HTMLInputElement;
	setPlaceholder(placeholder: string): void;
	setMaxLength(length: number): void;
	fitContent(): void;
	deleteInputContent(): void;
	addCloseButton(): void;
	addKeydownFilter(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function macInputKeydown(event: KeyboardEvent): void {
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
}

const addKeydownFilterKeydown = function (event: KeyboardEvent): void {
	if (event.altKey) {
		return;
	} else if (!event.cmdOrCtrlKey && !event.shiftKey) {
		switch (event.code) {
			case 'Escape':
			case 'F1':
			case 'F3':
			case 'F4':
			case 'F9':
				return;
		}
	}
	event.stopImmediatePropagation();
};

export function attachTextBoxApi(el: HTMLElement): void {
	const box = el as TextBoxElement;

	const input = document.createElement('input');
	addClass(input, 'text-box-input');
	input.type = 'text';
	input.history = new TextHistory(input);

	box.input = input;
	box.focusEventEnabled = false;
	box.blurEventEnabled = false;
	box.lastText = '';
	box.hiddenNodes = [];

	if (process.platform === 'darwin') {
		on(input, 'keydown', macInputKeydown as (event: EditorEvent) => void);
	}

	let isEditing = false;
	input.addEventListener('compositionstart', () => {
		isEditing = true;
	});
	input.addEventListener('compositionend', () => {
		isEditing = false;
	});
	input.addEventListener(
		'keydown',
		(e) => {
			if (!isEditing) {
				return;
			}
			switch (e.code) {
				case 'Escape':
				case 'Enter':
					e.stopPropagation();
					return;
			}
		},
		{ capture: true }
	);

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

	box.focus = function (): void {
		el.focus();
		input.focus();
	};

	box.getFocus = function (mode: string | null): HTMLInputElement {
		getFocus(input, mode ?? undefined);
		return input;
	};

	box.setPlaceholder = function (placeholder: string): void {
		input.placeholder = placeholder;
	};

	box.setMaxLength = function (length: number): void {
		input.maxLength = length;
	};

	box.fitContent = function (): void {
		const parent = el.parentNode as HTMLElement;
		el.style.width = '0';
		el.style.width = `${Math.clamp(
			input.scrollWidth + 2,
			0,
			rect(parent).right - rect(el).left
		)}px`;
	};

	box.deleteInputContent = function (): void {
		if (box.read() !== '') {
			input.select();
			input.dispatchEvent(
				new InputEvent('beforeinput', {
					inputType: 'deleteContentForward',
					bubbles: true
				})
			);
			document.execCommand('delete');
		}
	};

	const updateCloseButton = function (): void {
		const closeButton = box.closeButton;
		if (!closeButton) return;
		if (box.read() !== '') {
			show(closeButton);
		} else {
			hide(closeButton);
		}
	};

	box.addCloseButton = function (): void {
		const baseWrite = box.write;
		box.write = function (value: string): void {
			baseWrite(value);
			updateCloseButton();
		};
		const keydown = function (event: KeyboardEvent): void {
			switch (event.code) {
				case 'Escape':
					if (box.read() !== '') {
						event.stopPropagation();
						box.deleteInputContent();
					}
					break;
			}
		};
		const input = function (): void {
			updateCloseButton();
		};
		const closeButtonPointerdown = function (event: PointerEvent): void {
			event.preventDefault();
			event.stopPropagation();
		};
		const closeButtonClick = function (): void {
			box.deleteInputContent();
		};
		on(el, 'keydown', keydown);
		on(el, 'input', input);
		const closeButton = document.createElement('div');
		addClass(closeButton, 'box');
		addClass(closeButton, 'close-button');
		closeButton.textContent = '\u2716';
		on(closeButton, 'pointerdown', closeButtonPointerdown as (event: EditorEvent) => void);
		on(closeButton, 'click', closeButtonClick);
		box.closeButton = closeButton;
		el.appendChild(hide(closeButton));
	};

	box.addKeydownFilter = function (): void {
		on(el, 'keydown', addKeydownFilterKeydown);
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

export function createTextBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'text-box';
	attachTextBoxApi(el);
	return el;
}
