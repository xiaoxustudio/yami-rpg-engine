import { isApiAttached, markApiAttached } from '../../../utils/element-data';
import { attachApi } from '../../../utils/attach-api';
import { addClass, removeClass, dispatchChangeEvent } from '../../../utils/dom';
import { createPayloadEvent } from '../../../utils/payload-event';

export interface ColorBoxApiOptions {
	modelValue?: string;
	disabled?: boolean;
	colorPicker?: ((box: ColorBoxApi) => void) | null;
}

export interface ColorBoxApi extends HTMLElement {
	foreground: HTMLElement;
	dataValue: string | null;
	inputEventEnabled: boolean;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	input(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	on(...args: unknown[]): void;
	keydown(event: KeyboardEvent): void;
	mouseclick(event: Event): void;
}

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

export function attachColorBoxApi(el: HTMLElement, options: ColorBoxApiOptions = {}): ColorBoxApi {
	const box = el as unknown as ColorBoxApi;
	if (isApiAttached(box)) return box;

	const background = document.createElement('div');
	addClass(background, 'box');
	addClass(background, 'color-box-background');
	const foreground = document.createElement('div');
	addClass(foreground, 'box');
	addClass(foreground, 'color-box-foreground');

	box.foreground = foreground;
	let dataValue = '';
	Object.defineProperty(box, 'dataValue', {
		configurable: true,
		get: () => dataValue,
		set: (value: string) => {
			dataValue = value;
		}
	});
	box.inputEventEnabled = false;
	markApiAttached(box);

	box.appendChild(background);
	box.appendChild(foreground);
	box.tabIndex = 0;

	const read = function (): string {
		return box.dataValue ?? '';
	};

	const write = function (color: string): void {
		box.dataValue = color;
		const r = parseInt(color.slice(0, 2), 16);
		const g = parseInt(color.slice(2, 4), 16);
		const b = parseInt(color.slice(4, 6), 16);
		const a = parseInt(color.slice(6, 8), 16) / 255;
		foreground.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${a})`;
	};

	const input = function (color: string): void {
		if (box.dataValue !== color) {
			box.write(color);
			if (box.inputEventEnabled) {
				const input = createPayloadEvent(
					'input',
					{} as {
						value: string;
					}
				);
				input.value = box.dataValue ?? '';
				box.dispatchEvent(input);
			}
			dispatchChangeEvent(box);
		}
	};

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			showChildNodes(box);
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			hideChildNodes(box);
		}
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
		switch (type) {
			case 'input':
				box.inputEventEnabled = true;
				break;
		}
	};

	const keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Enter':
			case 'NumpadEnter':
				if (!(event as KeyboardEvent & { cmdOrCtrlKey?: boolean }).cmdOrCtrlKey) {
					event.stopPropagation();
					box.mouseclick(event);
				}
				break;
		}
	};

	const mouseclick = function (_event: Event): void {
		options.colorPicker?.(box);
	};

	attachApi<ColorBoxApi>(box, { read, write, input, enable, disable, on, keydown, mouseclick });

	// oxlint-disable-next-line unbound-method
	box.addEventListener('keydown', box.keydown as EventListener);
	// oxlint-disable-next-line unbound-method
	box.addEventListener('click', box.mouseclick);

	if (options.modelValue) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createColorBoxElement(options?: ColorBoxApiOptions): ColorBoxApi {
	const el = document.createElement('div');
	el.className = 'color-box';
	return attachColorBoxApi(el, options);
}
