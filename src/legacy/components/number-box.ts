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

export class NumberBox extends HTMLElement {
	input: HTMLInputElement;
	decimals: number;
	focusEventEnabled: boolean;
	blurEventEnabled: boolean;
	_initialized: boolean;
	_unit: string | null;
	_attrSource: HTMLElement | null;

	constructor(dom?: any) {
		super();

		const input = document.createElement('input');
		addClass(input, 'number-box-input');
		input.type = 'number';
		input.min = '0';
		input.max = '0';
		input.step = '1';
		input.title = '';
		input.history = new NumberHistory(input);
		on(input, 'keydown', this.inputKeydown);
		on(input, 'change', this.inputChange);

		this.input = input;
		this.decimals = 0;
		this.focusEventEnabled = false;
		this.blurEventEnabled = false;
		this._unit = null;
		this._initialized = false;
		this._attrSource = dom instanceof HTMLElement ? dom : null;
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;

		const src = this._attrSource ?? this;
		const min = src.getAttribute('min') ?? '0';
		const max = src.getAttribute('max') ?? '0';
		const step = src.getAttribute('step') ?? '1';
		const unit = src.getAttribute('unit');
		const decimals = parseInt(src.getAttribute('decimals')) || 0;

		const input = this.input;
		input.min = min;
		input.max = max;
		input.step = step;
		this.decimals = decimals;
		this._unit = unit;

		this.appendChild(input);

		if (this.childNodes.length > 1) {
			const label = this.childNodes[0].textContent;
			const font = 'var(--font-family-mono)';
			const padding = measureText(label, font).width + 8;
			input.style.paddingLeft = `${padding}px`;
		}

		if (unit !== null) {
			const unitText = document.createElement('text');
			const font = 'var(--font-family-mono)';
			const padding = measureText(unit, font).width + 8;
			addClass(unitText, 'unit');
			unitText.textContent = unit;
			this.insertBefore(unitText, input);
			input.style.paddingRight = `${padding}px`;
		}
	}

	read(): number {
		const min = parseFloat(this.input.min);
		const max = parseFloat(this.input.max);
		let value = parseFloat(this.input.value) || 0;
		value = Math.clamp(value, min, max);
		value = Math.roundTo(value, this.decimals);
		return value;
	}

	write(value: any): void {
		const { input } = this;
		input.value = String(value);
		input.value = String(read(this));
		input.history.reset();
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

	inputKeydown(event: any) {
		!NumberBox.whiteList.includes(event.code) && !event.cmdOrCtrlKey && event.preventDefault();
	}

	inputChange(event: any) {
		this.value = read(this.parentNode as HTMLElement);
	}

	static whiteList = [
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
	];
}

customElements.define('number-box', NumberBox);
