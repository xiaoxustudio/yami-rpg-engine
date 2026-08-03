import {
	on,
	addClass,
	removeClass,
	hideChildNodes,
	showChildNodes,
	dispatchChangeEvent
} from '@/util/element-utils.ts';
import { Color } from '@/tools/color-picker-window.ts';

interface ColorBoxElement extends HTMLElement {
	dataValue: string;
	foreground: HTMLElement;
	inputEventEnabled: boolean;
	_initialized: boolean;
	_background: HTMLElement;
	read(): string;
	write(color: string): void;
	input(color: string): void;
	enable(): void;
	disable(): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown(event: KeyboardEvent): void;
	mouseclick(event: Event): void;
}

export function attachColorBoxApi(el: HTMLElement): void {
	const box = el as ColorBoxElement;

	const background = document.createElement('div');
	addClass(background, 'box');
	addClass(background, 'color-box-background');
	const foreground = document.createElement('div');
	addClass(foreground, 'box');
	addClass(foreground, 'color-box-foreground');

	box.foreground = foreground;
	box._background = background;
	box.dataValue = '';
	box.inputEventEnabled = false;
	box._initialized = true;

	box.appendChild(background);
	box.appendChild(foreground);
	box.tabIndex = 0;

	box.read = function (): string {
		return box.dataValue;
	};

	box.write = function (color: string): void {
		box.dataValue = color;

		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	};

	box.input = function (color: string): void {
		if (box.dataValue !== color) {
			box.write(color);
			if (box.inputEventEnabled) {
				const input = new Event('input') as Event & {
					value: string;
				};
				input.value = box.dataValue;
				box.dispatchEvent(input);
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

	box.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, options);
		switch (type) {
			case 'input':
				box.inputEventEnabled = true;
				break;
		}
	};

	box.keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!event.cmdOrCtrlKey) {
					event.stopPropagation();
					box.mouseclick(event);
				}
				break;
		}
	};

	box.mouseclick = function (event: Event): void {
		Color.open(box);
	};

	on(box, 'keydown', box.keydown);
	on(box, 'click', box.mouseclick);
}

export function createColorBox(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'color-box';
	attachColorBoxApi(el);
	return el;
}
