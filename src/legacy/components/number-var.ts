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
import { createNumberBox } from './number-box.ts';

interface NumberVarElement extends HTMLElement {
	mode: string;
	numBox: HTMLElement & { [k: string]: any };
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
export const defVarForPlugin = { getter: 'variable', type: 'local', key: 'key' };

export function attachNumberVarApi(el: HTMLElement): void {
	const box = el as NumberVarElement;
	let currentMode: string = null as any;

	const numBox = createNumberBox(el) as HTMLElement & { [k: string]: any };
	const varBox = createCustomBox() as HTMLElement & { [k: string]: any };
	varBox.type = 'variable';
	varBox.filter = 'number';

	box.mode = currentMode;
	box.numBox = numBox;
	box.varBox = varBox;

	box.read = function (): any {
		switch (currentMode) {
			case 'constant':
				return read(numBox);
			case 'variable':
				return varBox.read();
		}
	};

	box.write = function (value: any): void {
		switch (typeof value) {
			case 'number':
				box.switch('constant');
				write(numBox, value);
				varBox.write(varBox.isPluginInput ? defVarForPlugin : defVar);
				break;
			case 'object':
				box.switch('variable');
				write(numBox, 0);
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
					box.appendChild(numBox);
					if (focus) {
						numBox.input.focus();
						numBox.input.select();
					}
					break;
				case 'variable':
					numBox.remove();
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
			enable(numBox);
			enable(varBox);
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			disable(numBox);
			disable(varBox);
		}
	};

	box.getFocus = function (mode: any): any {
		switch (currentMode) {
			case 'constant':
				return getFocus(numBox, mode);
			case 'variable':
				return getFocus(varBox, mode);
		}
	};

	box.keydown = function (event: any): void {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				box.switch();
				break;
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
			case 2:
				if (!hasClass(box, 'disabled')) {
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

export function createNumberVar(): HTMLElement {
	const el = document.createElement('div');
	el.className = 'number-var';
	attachNumberVarApi(el);
	return el;
}
