import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	dispatchChangeEvent
} from '@/util/element-utils.ts';
import { Color } from '@/tools/color-picker-window.ts';

export class ColorBox extends HTMLElement {
	dataValue: string;
	foreground: HTMLElement;
	inputEventEnabled: boolean;
	_initialized: boolean;
	_background: HTMLElement;

	constructor() {
		super();

		const background = document.createElement('box');
		addClass(background, 'color-box-background');
		const foreground = document.createElement('box');
		addClass(foreground, 'color-box-foreground');

		this.foreground = foreground;
		this._background = background;
		this.dataValue = '';
		this.inputEventEnabled = false;
		this._initialized = false;

		on(this, 'keydown', this.keydown);
		on(this, 'click', this.mouseclick);
	}

	connectedCallback() {
		if (this._initialized) return;
		this._initialized = true;
		this.appendChild(this._background);
		this.appendChild(this.foreground);
		this.tabIndex = 0;
	}

	read(): string {
		return this.dataValue;
	}

	write(color: string): void {
		this.dataValue = color;

		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		this.foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	}

	input(color: string): void {
		if (this.dataValue !== color) {
			this.write(color);
			if (this.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: string;
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
		}
	}

	keydown(event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					this.mouseclick(event);
				}
				break;
		}
	}

	mouseclick(event: Event): void {
		Color.open(this);
	}
}

customElements.define('color-box', ColorBox);
