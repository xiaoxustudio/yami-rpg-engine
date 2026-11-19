import { getElementApi, setElementApi } from '../../../utils/element-apis';
import { elementDataOf } from '../../../utils/element-data';
import { addClass, removeClass, hasClass } from '../../../utils/dom';
import type { CustomBoxApi } from '../../business/YMCustomBox/custom-box-api';
import type { TextBoxApi } from '../YMTextBox/text-box-api';
import { defVar } from '../YMNumberVar/number-var-api';

export interface StringVarApiOptions {
	customBoxFactory?: () => CustomBoxApi;
	textBoxFactory?: () => TextBoxApi;
	modelValue?: unknown;
	disabled?: boolean;
}

export interface StringVarApi extends HTMLElement {
	mode: string | null;
	strBox?: TextBoxApi | null;
	varBox?: CustomBoxApi | null;
	read(...args: unknown[]): unknown;
	write(...args: unknown[]): void;
	switch(...args: unknown[]): void;
	enable(...args: unknown[]): void;
	disable(...args: unknown[]): void;
	getFocus(mode?: string): unknown;
	keydown(event: KeyboardEvent): void;
	pointerdown(event: PointerEvent): void;
	on(...args: unknown[]): void;
}

export function attachStringVarApi(
	el: HTMLElement,
	options: StringVarApiOptions = {}
): StringVarApi {
	const box = el as StringVarApi;
	if (getElementApi(box)) return box;

	let currentMode: string | null = null;

	const strBox = (options.textBoxFactory ?? (() => null))() as TextBoxApi;
	const varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	varBox.type = 'variable';
	varBox.filter = 'string';

	elementDataOf<StringVarApi>(box).mode = currentMode;
	elementDataOf<StringVarApi>(box).strBox = strBox;
	elementDataOf<StringVarApi>(box).varBox = varBox;

	const readValue = function (): unknown {
		switch (currentMode) {
			case 'constant':
				return getElementApi<TextBoxApi>(strBox)?.read();
			case 'variable':
				return getElementApi<CustomBoxApi>(varBox)?.read();
		}
	};

	const writeValue = function (value: unknown): void {
		switch (typeof value) {
			case 'string':
				switchMode('constant');
				getElementApi<TextBoxApi>(strBox)?.write(value);
				getElementApi<CustomBoxApi>(varBox)?.write(defVar);
				break;
			case 'object':
				switchMode('variable');
				getElementApi<TextBoxApi>(strBox)?.write('');
				getElementApi<CustomBoxApi>(varBox)?.write(value);
				break;
		}
	};

	const switchMode = function (target?: string): void {
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
			removeClass(box, currentMode as string);
			addClass(box, target as string);
			currentMode = target as string;
			elementDataOf<StringVarApi>(box).mode = currentMode;
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

	const enable = function (): void {
		if (removeClass(box, 'disabled')) {
			getElementApi<TextBoxApi>(strBox)?.enable();
			getElementApi<CustomBoxApi>(varBox)?.enable();
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			getElementApi<TextBoxApi>(strBox)?.disable();
			getElementApi<CustomBoxApi>(varBox)?.disable();
		}
	};

	const getFocus = function (mode?: string): unknown {
		switch (currentMode) {
			case 'constant':
				return getElementApi<TextBoxApi>(strBox)?.getFocus(mode);
			case 'variable':
				return varBox.focus();
		}
	};

	const keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				switchMode();
				break;
		}
	};

	const pointerdown = function (event: PointerEvent): void {
		switch (event.button) {
			case 0:
				if (!hasClass(box, 'disabled') && event.target === box) {
					event.preventDefault();
					switchMode();
				}
				break;
			case 2:
				if (!hasClass(box, 'disabled')) {
					event.preventDefault();
					switchMode();
				}
				break;
		}
	};

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	setElementApi(box, {
		read: readValue,
		write: writeValue,
		switch: switchMode,
		enable,
		disable,
		getFocus,
		keydown,
		pointerdown,
		on
	});
	box.addEventListener('keydown', keydown as EventListener);
	box.addEventListener('pointerdown', pointerdown as EventListener);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		writeValue(options.modelValue);
	}
	if (options.disabled) {
		disable();
	}

	return box;
}

export function createStringVarElement(options?: StringVarApiOptions): StringVarApi {
	const el = document.createElement('div');
	el.className = 'string-var';
	return attachStringVarApi(el, options);
}
