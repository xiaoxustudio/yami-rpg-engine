import { attachApi } from '../../../utils/attach-api';
import { elementDataOf, isApiAttached, markApiAttached } from '../../../utils/element-data';
import { addClass, removeClass, hasClass, read, write } from '../../../utils/dom';
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
	if (isApiAttached(box)) return box;

	let currentMode: string | null = null;

	const strBox = (options.textBoxFactory ?? (() => null))() as TextBoxApi;
	const varBox = (options.customBoxFactory ?? (() => null))() as CustomBoxApi;
	varBox.type = 'variable';
	varBox.filter = 'string';

	elementDataOf<StringVarApi>(box).mode = currentMode;
	// strBox 走显式元素数据（字段已从 DATA_FIELDS 摘除）
	elementDataOf<StringVarApi>(box).strBox = strBox;
	elementDataOf<StringVarApi>(box).varBox = varBox;

	const readValue = function (): unknown {
		switch (currentMode) {
			case 'constant':
				return read(strBox);
			case 'variable':
				return varBox.read();
		}
	};

	const writeValue = function (value: unknown): void {
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
			strBox.enable();
			varBox.enable();
		}
	};

	const disable = function (): void {
		if (addClass(box, 'disabled')) {
			strBox.disable();
			varBox.disable();
		}
	};

	const getFocus = function (mode?: string): unknown {
		switch (currentMode) {
			case 'constant':
				return strBox.getFocus(mode);
			case 'variable':
				return varBox.focus();
		}
	};

	const keydown = function (event: KeyboardEvent): void {
		switch (event.code) {
			case 'Slash':
				event.preventDefault();
				box.switch();
				break;
		}
	};

	const pointerdown = function (event: PointerEvent): void {
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

	const on = function (
		type: string,
		listener: (event: Event) => void,
		listenerOptions?: boolean | AddEventListenerOptions
	): void {
		box.addEventListener(type, listener as EventListener, listenerOptions);
	};

	attachApi<StringVarApi>(box, {
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

	markApiAttached(box);
	// 直接引用本文件的局部实现（与 `attachApi` 挂到元素上的是同一个引用），
	// 不再取 `box.keydown` 这个方法引用——"方法引用丢 this" 正是 unbound-method 的成因。
	box.addEventListener('keydown', keydown as EventListener);
	box.addEventListener('pointerdown', pointerdown as EventListener);

	if (options.modelValue !== undefined && options.modelValue !== null) {
		box.write(options.modelValue);
	}
	if (options.disabled) {
		box.disable();
	}

	return box;
}

export function createStringVarElement(options?: StringVarApiOptions): StringVarApi {
	const el = document.createElement('div');
	el.className = 'string-var';
	return attachStringVarApi(el, options);
}
