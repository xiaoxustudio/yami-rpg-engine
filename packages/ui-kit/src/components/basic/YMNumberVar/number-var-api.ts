import {
	addClass,
	removeClass,
	hasClass,
	read,
	write,
	dispatchChangeEvent
} from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import type { NumberBoxApi } from '../YMNumberBox/number-box-api';

export interface NumberVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	numberBoxFactory?: (dom?: any) => NumberBoxApi;
	modelValue?: any;
	disabled?: boolean;
}

export interface NumberVarApi extends HTMLElement {
	mode: string;
	numBox: NumberBoxApi;
	varBox?: CustomBoxApi | null;
	_initialized: boolean;
	read(...args: unknown[]): any;
	write(...args: unknown[]): any;
	switch(...args: unknown[]): any;
	enable(...args: unknown[]): any;
	disable(...args: unknown[]): any;
	getFocus(mode: any): any;
	on(...args: unknown[]): any;
	keydown(event: any): void;
	pointerdown(event: any): void;
}

export const defVar = { type: 'local', key: 'key' };
export const defVarForPlugin = { getter: 'variable', type: 'local', key: 'key' };

export function attachNumberVarApi(
	el: HTMLElement,
	options: NumberVarApiOptions = {}
): NumberVarApi {
	const box = el as NumberVarApi;
	if (box._initialized) return box;

	let currentMode: string = null as any;

	const numBox = (options.numberBoxFactory ?? (() => null))(el) as NumberBoxApi;
	const varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
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
			case 'string': {
				const n = Number(value);
				if (!isNaN(n)) {
					box.switch('constant');
					write(numBox, n);
					varBox.write(varBox.isPluginInput ? defVarForPlugin : defVar);
				}
				break;
			}
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
					if (focus && numBox.input) {
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
			numBox.enable();
			varBox.enable();
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			numBox.disable();
			varBox.disable();
		}
	};

	box.getFocus = function (mode: any): any {
		switch (currentMode) {
			case 'constant':
				return numBox.getFocus(mode);
			case 'variable':
				return varBox.focus();
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
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	box._initialized = true;
	box.addEventListener('keydown', box.keydown as EventListener);
	box.addEventListener('pointerdown', box.pointerdown as EventListener);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createNumberVarElement(options?: NumberVarApiOptions): NumberVarApi {
	const el = document.createElement('div');
	el.className = 'number-var';
	return attachNumberVarApi(el, options);
}
