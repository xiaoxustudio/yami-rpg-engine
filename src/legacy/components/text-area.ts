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
import { TextBox } from './text-box.ts';

export class TextArea extends HTMLElement {
	input: HTMLElement;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;

	constructor() {
		super();

		const input = document.createElement('textarea');
		input.history = new TextHistory(input);
		on(input, 'keydown', this.inputKeydown);
		on(input, 'input', this.inputInput);
		listenDraggingScrollbarEvent(input);

		this.input = input;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;
		this._initialized = false;

		if (process.platform === 'darwin') {
			on(input, 'keydown', TextBox.macInputKeydown as (event: EditorEvent) => void);
		}
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
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

	enable() {
		if (removeClass(this, 'disabled')) {
			showChildNodes(this);
		}
	}

	disable() {
		if (addClass(this, 'disabled')) {
			hideChildNodes(this);
		}
	}

	getFocus(mode: any) {
		return getFocus(this.input, mode);
	}

	inputKeydown(event: any) {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
				}
				break;
		}
		if (!TextArea.target) {
			TextArea.target = this;
			TextArea.timer.add();
			addClass(this, 'inputting');
		}
	}

	inputInput(event: any) {
		if (!TextArea.target) {
			TextArea.target = this;
			TextArea.timer.add();
			addClass(this, 'inputting');
		}
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
					on(this.input, 'focus', (event) => {
						this.dispatchEvent(new FocusEvent('focus'));
					});
				}
				break;
			case 'blur':
				if (!this.blurEventEnabled) {
					this.blurEventEnabled = true;
					on(this.input, 'blur', (event) => {
						this.dispatchEvent(new FocusEvent('blur'));
					});
				}
				break;
		}
	}

	static target: HTMLElement | null = null;

	static timer = new Timer({
		duration: 0,
		callback: (timer) => {
			removeClass(TextArea.target!, 'inputting');
			TextArea.target = null;
		}
	});
}

customElements.define('text-area', TextArea);
