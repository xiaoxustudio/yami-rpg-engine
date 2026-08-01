import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

export class KeyboardBox extends HTMLElement {
	input: HTMLInputElement;
	dataValue: number;
	inputEventEnabled: boolean;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;

	constructor() {
		super();

		const input = document.createElement('input');
		addClass(input, 'keyboard-box-input');
		input.type = 'text';
		on(input, 'keydown', this.inputKeydown);

		this.input = input;
		this.dataValue = 0;
		this.inputEventEnabled = false;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;
		this._initialized = false;
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.appendChild(this.input);
	}

	read(): number {
		return this.dataValue;
	}

	write(code: number): void {
		this.dataValue = code;
		this.input.value = String(code);
	}

	inputCode(code: number): void {
		if (this.dataValue !== code) {
			this.write(code);
			if (this.inputEventEnabled) {
				const input = new InputEvent('input') as InputEvent & {
					value: number;
				};
				input.value = this.dataValue;
				this.dispatchEvent(input);
			}
			dispatchChangeEvent(this);
		}
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

	getFocus(mode: string): HTMLInputElement {
		return getFocus(this.input, mode) as any;
	}

	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		super.on(type, listener, options);
		switch (type) {
			case 'input':
				this.inputEventEnabled = true;
				break;
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

	inputKeydown(event: KeyboardEvent): void {
		event.stopPropagation();
		event.preventDefault();
		switch (event.code) {
			case 'Backspace':
				(this.parentNode as KeyboardBox).inputCode(0);
				break;
			case 'Enter':
			case 'NumpadEnter':
				event.stopImmediatePropagation();
			default:
				(this.parentNode as KeyboardBox).inputCode(parseInt(event.code) || 0);
				break;
		}
	}
}

customElements.define('keyboard-box', KeyboardBox);
