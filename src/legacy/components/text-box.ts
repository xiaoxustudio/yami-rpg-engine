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

export class TextBox extends HTMLElement {
	input: HTMLInputElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	// tree-list 等用于在 TextBox 实例上绑定重命名前的原文与被隐藏的子节点
	lastText: string = '';
	hiddenNodes: any[] = [];
	declare closeButton: HTMLElement | null;

	constructor() {
		super();

		const input = document.createElement('input');
		addClass(input, 'text-box-input');
		input.type = 'text';
		input.history = new TextHistory(input);

		this.input = input;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;

		if (process.platform === 'darwin') {
			on(input, 'keydown', TextBox.macInputKeydown as (event: EditorEvent) => void);
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
	}

	connectedCallback() {
		if (this._built) return;
		this._built = true;
		this.appendChild(this.input);
	}

	read(): string {
		return this.input.value;
	}

	write(value: string): void {
		this.input.value = value;
		this.input.history.reset();
	}

	insert(value: string): void {
		this.input.dispatchEvent(
			new InputEvent('beforeinput', {
				inputType: 'insertFromPaste',
				data: value,
				bubbles: true
			})
		);
		document.execCommand('insertText', false, value);
	}

	enable(): void {
		if (removeClass(this, 'disabled')) {
			showChildNodes(this);
		}
	}

	disable(): void {
		if (addClass(this, 'disabled')) {
			hideChildNodes(this);
		}
	}

	focus(): void {
		super.focus();
		this.input.focus();
	}

	getFocus(mode: string | null): HTMLInputElement {
		getFocus(this.input, mode ?? undefined);
		return this.input;
	}

	setPlaceholder(placeholder: string): void {
		this.input.placeholder = placeholder;
	}

	setMaxLength(length: number): void {
		this.input.maxLength = length;
	}

	fitContent(): void {
		const parent = this.parentNode as HTMLElement;
		this.style.width = '0';
		this.style.width = `${Math.clamp(
			this.input.scrollWidth + 2,
			0,
			rect(parent).right - rect(this).left
		)}px`;
	}

	deleteInputContent(): void {
		if (this.read() !== '') {
			this.input.select();
			this.input.dispatchEvent(
				new InputEvent('beforeinput', {
					inputType: 'deleteContentForward',
					bubbles: true
				})
			);
			document.execCommand('delete');
		}
	}

	addCloseButton(): void {
		return TextBox.addCloseButton(this);
	}

	addKeydownFilter(): void {
		return TextBox.addKeydownFilter(this);
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'focus':
				if (!this.focusEventEnabled) {
					this.focusEventEnabled = true;
					on(this.input, 'focus', (event: Event) => {
						this.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!this.blurEventEnabled) {
					this.blurEventEnabled = true;
					on(this.input, 'blur', (event: Event) => {
						this.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	}

	static addCloseButton = (function IIFE() {
		const write = function (this: TextBox, value: string): void {
			TextBox.prototype.write.call(this, value);
			updateCloseButton(this);
		};
		const updateCloseButton = function (textBox: TextBox): void {
			if (textBox.read() !== '') {
				show(textBox.closeButton as HTMLElement);
			} else {
				hide(textBox.closeButton as HTMLElement);
			}
		};
		const keydown = function (this: TextBox, event: KeyboardEvent): void {
			switch (event.code) {
				case 'Escape':
					if (this.read() !== '') {
						event.stopPropagation();
						this.deleteInputContent();
					}
					break;
			}
		};
		const input = function (this: TextBox, event: Event): void {
			updateCloseButton(this);
		};
		const closeButtonPointerdown = function (event: PointerEvent): void {
			event.preventDefault();
			event.stopPropagation();
		};
		const closeButtonClick = function (this: HTMLElement, event: Event): void {
			(this.parentNode as TextBox).deleteInputContent();
		};
		return (textBox: TextBox): void => {
			textBox.write = write;
			on(textBox, 'keydown', keydown);
			on(textBox, 'input', input);
			textBox.closeButton = document.createElement('box');
			addClass(textBox.closeButton as HTMLElement, 'close-button');
			(textBox.closeButton as HTMLElement).textContent = '\u2716';
			on(
				textBox.closeButton as HTMLElement,
				'pointerdown',
				closeButtonPointerdown as (event: EditorEvent) => void
			);
			on(textBox.closeButton as HTMLElement, 'click', closeButtonClick);
			textBox.appendChild(hide(textBox.closeButton as HTMLElement));
		};
	})();

	static addKeydownFilter = (function IIFE() {
		const keydown = function (event: KeyboardEvent): void {
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
		return (textBox: TextBox): void => {
			on(textBox, 'keydown', keydown);
		};
	})();

	static macInputKeydown(event: KeyboardEvent): void {
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
}

customElements.define('text-box', TextBox);
