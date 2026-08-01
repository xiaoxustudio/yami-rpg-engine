import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	getFocus,
	write,
	dispatchChangeEvent
} from '@/util/element-utils.ts';

export class GamepadBox extends HTMLElement {
	input: HTMLElement;
	dataValue: number;
	static intervalIndex;

	constructor() {
		super();

		const input = document.createElement('input');
		addClass(input, 'gamepad-box-input');
		input.type = 'text';
		on(input, 'keydown', this.inputKeydown);
		on(input, 'focus', this.inputFocus);
		on(input, 'blur', this.inputBlur);

		this.input = input;
		this.dataValue = null;
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.appendChild(this.input);
	}

	read(): number | null {
		return this.dataValue;
	}

	write(button: number): void {
		this.dataValue = button;
		this.input.value = GamepadBox.getButtonName(button);
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
			case 'Tab':
				break;
			case 'Backspace':
				event.preventDefault();
				write(this.parentNode as any, -1);
				dispatchChangeEvent(this.parentNode as any);
				break;
			default:
				event.preventDefault();
				break;
		}
	}

	inputFocus(event: any) {
		let lastPad = null;

		const inputKeyCode = () => {
			const pads = navigator.getGamepads();
			const pad = pads[0] || pads[1] || pads[2] || pads[3] || null;
			if (pad !== null) {
				if (lastPad === null) {
					lastPad = Object.clone(pad);
					for (const button of lastPad.buttons) {
						button.pressed = false;
						button.value = 0;
					}
				}
				if (lastPad.id === pad.id) {
					const lastButtons = lastPad.buttons;
					const buttons = pad.buttons;
					const length = buttons.length;
					for (let code = 0; code < length; code++) {
						if (buttons[code].pressed && !lastButtons[code].pressed) {
							write(this.parentNode as any, code);
							dispatchChangeEvent(this.parentNode as any);
							break;
						}
					}
				}
				lastPad = Object.clone(pad);
			}
		};

		GamepadBox.intervalIndex = setInterval(inputKeyCode);
	}

	inputBlur(event: any) {
		clearInterval(GamepadBox.intervalIndex);
		GamepadBox.intervalIndex = null;
	}

	static getButtonName = (function IIFE() {
		const codeToName = {
			0: 'A',
			1: 'B',
			2: 'X',
			3: 'Y',
			4: 'LB',
			5: 'RB',
			6: 'LT',
			7: 'RT',
			8: 'View',
			9: 'Menu',
			10: 'LS',
			11: 'RS',
			12: 'Up',
			13: 'Down',
			14: 'Left',
			15: 'Right'
		};

		return function (code) {
			return code === -1 ? '' : (codeToName[code] ?? `Button_${code}`);
		};
	})();
}

customElements.define('gamepad-box', GamepadBox);
