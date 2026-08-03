import {
	on,
	addClass,
	removeClass,
	hasClass,
	getFocus,
	dispatchChangeEvent,
	enable,
	disable,
	read,
	write
} from '@/util/element-utils.ts';
import { createCustomBox } from './custom-box.ts';
import { createTextArea } from './text-area.ts';

interface TextAreaVarElement extends HTMLElement {
	mode: string;
	strBox: HTMLElement & { [k: string]: any };
	varBox: HTMLElement & { [k: string]: any };
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): any;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
	keydown(event: any): void;
	pointerdown(event: any): void;
}

export const defVar = { type: 'local', key: 'key' };

export function attachTextAreaVarApi(el: HTMLElement): void {
	const box = el as TextAreaVarElement;
	let currentMode: string = null as any;

	const strBox = createTextArea() as HTMLElement & { [k: string]: any };
	const varBox = createCustomBox() as HTMLElement & { [k: string]: any };
	varBox.type = 'variable';
	varBox.filter = 'string';

	const menu = box.getAttribute('menu');
	if (menu) {
		strBox.setAttribute('menu', menu);
	}

	box.mode = currentMode;
	box.strBox = strBox;
	box.varBox = varBox;

	box.read = function (): any {
		switch (currentMode) {
			case 'constant':
				return read(strBox);
			case 'variable':
				return varBox.read();
		}
	};

	box.write = function (value: any): void {
		switch (typeof value) {
			case 'string':
				box.switch('constant');
				write(strBox, value);
				varBox.write(defVar);
				break;
			case 'object':
				box.switch('variable');
				write(strBox, '');
				varBox.write(value);
				break;
		}
	};

	box.switch = function (target?: string): void {
		const focus = !target && !hasClass(box, 'disabled');
		if (target === undefined) {
			switch (currentMode) {
				case 'constant':
					target = 'variable';
					break;
				case 'variable':
					target = 'constant';
					break;
			}
		}
		if (currentMode !== target) {
			removeClass(box, currentMode);
			addClass(box, target as string);
			currentMode = target as string;
			box.mode = currentMode;
			switch (target) {
				case 'constant':
					varBox.remove();
					box.appendChild(strBox);
					if (focus) {
						strBox.input.focus();
						strBox.input.select();
					}
					break;
				case 'variable':
					strBox.remove();
					box.appendChild(varBox);
					if (focus) {
						varBox.focus();
					}
					break;
			}
			dispatchChangeEvent(box);
		}
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			enable(strBox);
			enable(varBox);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			disable(strBox);
			disable(varBox);
		}
	};

	box.getFocus = function (mode: any): any {
		switch (currentMode) {
			case 'constant':
				return getFocus(strBox, mode);
			case 'variable':
				return getFocus(varBox, mode);
		}
	};

	box.keydown = function (event: any): void {
		if (event.cmdOrCtrlKey || event.altKey) {
			switch (event.code) {
				case 'Slash':
					event.preventDefault();
					box.switch();
					break;
			}
		}
	};

	box.pointerdown = function (event: any): void {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'disabled') && event.target === box) {
					event.preventDefault();
					box.switch();
				}
				break;
		}
	};

	box.on = function (
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, options);
	};

	on(box, 'keydown', box.keydown);
	on(box, 'pointerdown', box.pointerdown);
}

export function createTextAreaVar(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'text-area-var';
	attachTextAreaVarApi(el);
	return el;
}
