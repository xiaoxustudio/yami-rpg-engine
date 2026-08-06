import { addClass, removeClass, hasClass, read, write } from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import type { TextAreaApi } from '../YMTextArea/text-area-api';
import { defVar } from '../YMNumberVar/number-var-api';

export interface TextAreaVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	textAreaFactory?: () => TextAreaApi;
	modelValue?: any;
	disabled?: boolean;
}

export interface TextAreaVarApi extends HTMLElement {
	mode: string;
	strBox: TextAreaApi;
	varBox: CustomBoxApi;
	_initialized: boolean;
	read(): any;
	write(value: any): void;
	switch(mode?: string): void;
	enable(): void;
	disable(): void;
	getFocus(mode: any): any;
	keydown(event: any): void;
	pointerdown(event: any): void;
	on(
		type: string,
		listener: (event: any) => void,
		options?: boolean | AddEventListenerOptions
	): void;
}

export function attachTextAreaVarApi(
	el: HTMLElement,
	options: TextAreaVarApiOptions = {}
): TextAreaVarApi {
	const box = el as TextAreaVarApi;
	if (box._initialized) return box;

	let currentMode: string = null as any;

	const strBox = (options.textAreaFactory ?? (() => null))() as TextAreaApi;
	const varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	varBox.type = 'variable';
	varBox.filter = 'string';

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
					if (focus && strBox.input) {
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
		}
	};

	box.enable = function (): void {
		if (removeClass(box, 'disabled')) {
			strBox.enable();
			varBox.enable();
		}
	};

	box.disable = function (): void {
		if (addClass(box, 'disabled')) {
			strBox.disable();
			varBox.disable();
		}
	};

	box.getFocus = function (mode: any): any {
		switch (currentMode) {
			case 'constant':
				return strBox.getFocus(mode);
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

export function createTextAreaVarElement(options?: TextAreaVarApiOptions): TextAreaVarApi {
	const el = document.createElement('div');
	el.className = 'textarea-var';
	return attachTextAreaVarApi(el, options);
}
